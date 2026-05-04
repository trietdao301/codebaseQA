import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { getOctokitServerClient } from "@/lib/client/octokit_server";

function parseGithubUrl(github_url: string): { owner: string; repo: string } {
  const match = github_url.match(
    /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/|$)/,
  );
  if (!match) throw new Error(`Invalid GitHub URL: ${github_url}`);
  return { owner: match[1], repo: match[2] };
}

type FileRequestBody = {
  repoUrl: string; // github url
  filePath: string; // path to file
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as FileRequestBody;

    const repoUrl = body.repoUrl;
    const filePath = body.filePath;

    if (!repoUrl || !filePath) {
      return NextResponse.json(
        { success: false, error: "repoUrl and file are required." },
        { status: 400 },
      );
    }

    const { owner, repo } = parseGithubUrl(repoUrl);
    const octokitServerClient = await getOctokitServerClient();
    const { data } = await octokitServerClient.rest.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    // getContent can return a file or directory, make sure it's a file
    if (Array.isArray(data) || data.type !== "file") {
      return NextResponse.json(
        { success: false, error: "Path is not a file." },
        { status: 400 },
      );
    }

    // content is base64 encoded
    const content = Buffer.from(data.content, "base64").toString("utf8");

    return NextResponse.json({
      success: true,
      filePath: data.path,
      content,
    });
  } catch (error: any) {
    // Octokit throws 404 as an error
    if (error?.status === 404) {
      return NextResponse.json(
        { success: false, error: "File not found." },
        { status: 404 },
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
