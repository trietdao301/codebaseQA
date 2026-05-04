import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";
import { DirectoryNode } from "./types/DirectoryNode";

interface GithubTreeItem {
  path?: string;
  type?: string;
  sha?: string;
  url?: string;
}

function parseGithubUrl(github_url: string): { owner: string; repo: string } {
  const match = github_url.match(
    /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/|$)/,
  );
  if (!match) throw new Error(`Invalid GitHub URL: ${github_url}`);
  return { owner: match[1], repo: match[2] };
}

function sortNodes(nodes: DirectoryNode[]): DirectoryNode[] {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  nodes.forEach((n) => n.children && sortNodes(n.children));
  return nodes;
}

export async function buildDirectoryTree(
  octokitServerClient: Octokit,
  github_url: string,
): Promise<DirectoryNode[]> {
  const { owner, repo } = parseGithubUrl(github_url);
  const SKIP_DIRS = new Set([
    "node_modules",
    ".git",
    "dist",
    ".next",
    "__pycache__",
    "build",
  ]);

  // Step 1 - get default branch
  const { data: repoData } = await octokitServerClient.rest.repos.get({
    owner,
    repo,
  });
  const defaultBranch = repoData.default_branch;

  // Step 2 - get the tree SHA from the branch
  const { data: branchData } = await octokitServerClient.rest.repos.getBranch({
    owner,
    repo,
    branch: defaultBranch,
  });
  const treeSha = branchData.commit.commit.tree.sha;

  // Step 3 - fetch full recursive tree
  const { data: treeData } = await octokitServerClient.rest.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: "1",
  });

  // Step 4 - build nested structure from flat list
  const root: DirectoryNode[] = [];
  const dirMap = new Map<string, DirectoryNode[]>();
  dirMap.set("", root);

  const items: GithubTreeItem[] = treeData.tree.sort((a, b) =>
    (a.path ?? "").localeCompare(b.path ?? ""),
  );

  for (const item of items) {
    if (!item.path || !item.type) continue;

    const parts = item.path.split("/");
    const name = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join("/");

    // Skip hidden files/folders and ignored dirs
    if (name.startsWith(".")) continue;
    if (parts.some((p) => SKIP_DIRS.has(p))) continue;

    const parentChildren = dirMap.get(parentPath);
    if (!parentChildren) continue; // parent was skipped

    if (item.type === "tree") {
      const children: DirectoryNode[] = [];
      const node: DirectoryNode = {
        name,
        path: item.path,
        type: "directory",
        children,
      };
      parentChildren.push(node);
      dirMap.set(item.path, children);
    } else {
      parentChildren.push({ name, path: item.path, type: "file" });
    }
  }

  return sortNodes(root);
}
