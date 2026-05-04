import { CLONE_ROOT } from "@/lib/config";
import { buildDirectoryTree } from "@/lib/buildTree";
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { DirectoryNode } from "@/lib/types/DirectoryNode";
import { getOctokitServerClient } from "@/lib/client/octokit_server";
import { Octokit } from "@octokit/rest";

type TreeRequestBody = {
  repoUrl: string; // github url
};
export async function POST(req: Request) {
  try {
    // const url = new URL(req.url);
    // const rootParam = url.searchParams.get("root");
    // const rootPath = resolveSafeRoot(rootParam);
    const body = (await req.json()) as TreeRequestBody;
    const repoUrl = body.repoUrl?.trim() ?? "";

    // const rootPath = CLONE_ROOT;
    // if (!rootPath) {
    //   return NextResponse.json({ success: false, error: "Invalid root path." }, { status: 400 });
    // }

    // const stat = await fs.stat(rootPath).catch(() => null);
    // if (!stat || !stat.isDirectory()) {
    //   return NextResponse.json({ success: false, error: "Repository folder not found." }, { status: 404 });
    // }
    const octokitServerClient = await getOctokitServerClient();
    const tree: DirectoryNode[] = await buildDirectoryTree(
      octokitServerClient,
      repoUrl,
    );
    return NextResponse.json({ success: true, tree });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
