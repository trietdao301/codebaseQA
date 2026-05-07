import type { ReactNode } from "react";
import { makeAssistantToolUI } from "@assistant-ui/react";
import { FolderTree } from "lucide-react";
import type { DirectoryNode } from "@/lib/types/DirectoryNode";
import { parseJsonResult, ToolCallShell } from "./toolUiShared";

type ListDirArgs = Record<string, unknown>;

const TREE_PREVIEW_MAX = 80;

function countNodes(nodes: DirectoryNode[]): { files: number; dirs: number } {
  let files = 0;
  let dirs = 0;
  for (const n of nodes) {
    if (n.type === "directory") {
      dirs += 1;
      if (n.children?.length) {
        const c = countNodes(n.children);
        files += c.files;
        dirs += c.dirs;
      }
    } else {
      files += 1;
    }
  }
  return { files, dirs };
}

function countAllNodes(nodes: DirectoryNode[]): number {
  let total = 0;
  for (const n of nodes) {
    total += 1;
    if (n.children?.length) total += countAllNodes(n.children);
  }
  return total;
}

function TreeOutline({
  nodes,
  depth,
  seen,
}: {
  nodes: DirectoryNode[];
  depth: number;
  seen: { n: number };
}): ReactNode {
  if (depth > 8 || seen.n >= TREE_PREVIEW_MAX) return null;
  return (
    <ul
      className={
        depth === 0 ? "space-y-0.5" : "ml-3 space-y-0.5 border-l border-zinc-800 pl-2"
      }
    >
      {nodes.map((node) => {
        if (seen.n >= TREE_PREVIEW_MAX) return null;
        seen.n += 1;
        const icon = node.type === "directory" ? "📁" : "📄";
        return (
          <li key={node.path} className="font-mono text-[10px] text-zinc-400">
            <span className="text-zinc-600">{icon}</span>{" "}
            <span className="text-zinc-300">{node.name}</span>
            {node.type === "directory" && node.children?.length ? (
              <TreeOutline nodes={node.children} depth={depth + 1} seen={seen} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export const ListDirectory = makeAssistantToolUI<ListDirArgs, string>({
  toolName: "list_files_and_directories_in_codebase",
  render: ({ result, status, isError }) => {
    const tree = parseJsonResult<DirectoryNode[]>(result);
    const counts = tree?.length ? countNodes(tree) : null;
    const totalNodes = tree?.length ? countAllNodes(tree) : 0;

    return (
      <ToolCallShell
        icon={<FolderTree className="h-4 w-4 text-emerald-400" />}
        title="Repository tree"
        subtitle="Full file / folder hierarchy from GitHub"
        status={status}
        accent="emerald"
      >
        {status.type === "running" ? (
          <p className="text-zinc-500">Loading tree from the API…</p>
        ) : isError ? (
          <pre className="whitespace-pre-wrap break-words rounded-md border border-red-500/30 bg-red-950/30 p-2 font-mono text-[11px] text-red-200">
            {typeof result === "string" ? result : String(result)}
          </pre>
        ) : tree && tree.length > 0 ? (
          <div className="space-y-2">
            {counts ? (
              <p className="text-[11px] text-zinc-500">
                <span className="text-zinc-300">{counts.files}</span> files,{" "}
                <span className="text-zinc-300">{counts.dirs}</span> folders (recursive),{" "}
                <span className="text-zinc-300">{tree.length}</span> top-level{" "}
                {tree.length === 1 ? "entry" : "entries"}
              </p>
            ) : null}
            <div className="rounded-md border border-zinc-800/90 bg-zinc-900/40 p-2">
              <TreeOutline nodes={tree} depth={0} seen={{ n: 0 }} />
            </div>
            {totalNodes > TREE_PREVIEW_MAX ? (
              <p className="text-[10px] text-zinc-600">
                Preview shows first {TREE_PREVIEW_MAX} nodes ({totalNodes.toLocaleString()} total).
                Use the workspace file tree for the full hierarchy.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-zinc-500">
            Empty tree or could not parse result
            {typeof result === "string" && result.length > 0 ? (
              <span className="mt-2 block font-mono text-[10px] text-zinc-600">
                Raw: {result.slice(0, 400)}
                {result.length > 400 ? "…" : ""}
              </span>
            ) : null}
          </p>
        )}
      </ToolCallShell>
    );
  },
});
