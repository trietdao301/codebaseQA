import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { indexCodeBase } from "@/lib/index/indexCodeBase";

import { openai } from "@/lib/client/openai";
import { qdrantClient } from "@/lib/client/qdrant";
import { getSupabaseServerClient } from "@/lib/client/supabase_server";

export type IndexRepoBody = {
  repoUrl: string;
};

type StreamEvent = {
  type:
    | "clone_started"
    | "clone_completed"
    | "index_progress"
    | "index_completed"
    | "done"
    | "error";
  message: string;
  repoUrl?: string;
  localPath?: string;
  stage?: string;
  count?: number;
  total?: number;
  file?: string;
};

function parseGithubRepoUrl(value: string): URL | null {
  try {
    const parsed = new URL(value.trim());
    const isGithubHost =
      parsed.hostname === "github.com" || parsed.hostname === "www.github.com";
    if (!isGithubHost) {
      return null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function getRepoFolderName(repoPath: string): string {
  const repoName = repoPath.split("/").filter(Boolean)[1] ?? "repo";
  return repoName.endsWith(".git") ? repoName.slice(0, -4) : repoName;
}

function cloneRepository(repoUrl: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["clone", repoUrl, destination], {
      shell: process.platform === "win32",
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `git clone failed with code ${code}`));
      }
    });
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IndexRepoBody;
    const repoUrl = body.repoUrl?.trim() ?? "";
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("repo_url", repoUrl)
      .maybeSingle();
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
    if (data) {
      return NextResponse.json(
        { success: false, error: "Repository already indexed" },
        { status: 400 },
      );
    }
    const parsed = parseGithubRepoUrl(repoUrl);

    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid GitHub repository URL.",
        },
        { status: 400 },
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const safeEnqueue = (event: StreamEvent) =>
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

        try {
          const cloneRoot = path.join(process.cwd(), "cloned_repos");
          await fs.mkdir(cloneRoot, { recursive: true });

          //const baseFolder = getRepoFolderName(parsed.pathname);
          //const destination = path.join(cloneRoot, `${baseFolder}}`);
          const destination = cloneRoot;
          safeEnqueue({
            type: "clone_started",
            message: "Cloning repository...",
            repoUrl: parsed.toString(),
          });

          await cloneRepository(parsed.toString(), cloneRoot);

          safeEnqueue({
            type: "clone_completed",
            message: "Repository cloned successfully.",
            repoUrl: parsed.toString(),
            localPath: destination,
          });

          for await (const progress of indexCodeBase(
            destination,
            qdrantClient,
            openai,
            supabase,
            parsed.toString(),
          )) {
            if (progress.stage === "semantic_indexing_done") {
              safeEnqueue({
                type: "index_completed",
                message: `Indexing completed (${progress.count}/${progress.total}).`,
                stage: progress.stage,
                count: progress.count,
                total: progress.total,
                localPath: destination,
              });
              continue;
            }

            safeEnqueue({
              type: "index_progress",
              message: `Stage ${progress.stage} in progress...`,
              stage: progress.stage,
              count: "count" in progress ? progress.count : undefined,
              total: "total" in progress ? progress.total : undefined,
              file: "file" in progress ? progress.file : undefined,
              localPath: destination,
            });
          }

          safeEnqueue({
            type: "done",
            message: "Clone and indexing pipeline completed.",
            repoUrl: parsed.toString(),
            localPath: destination,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          safeEnqueue({ type: "error", message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : (JSON.stringify(error) ?? "Unknown error"); // ← reveal what actually threw

    console.error("[indexRepo] pipeline error:", error); // ← log full error server-side
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
