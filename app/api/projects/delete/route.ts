import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/client/supabase_server";
import { COLLECTION_NAME, qdrantClient } from "@/lib/client/qdrant";

type DeleteProjectBody = {
  projectId?: string;
  githubRepoUrl?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DeleteProjectBody;
    const projectId = body.projectId?.trim();
    const githubRepoUrl = body.githubRepoUrl?.trim();

    if (!projectId || !githubRepoUrl) {
      return NextResponse.json(
        { success: false, error: "projectId and githubRepoUrl are required." },
        { status: 400 },
      );
    }

    const supabase = await getSupabaseServerClient();

    const { error: projectDeleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);
    if (projectDeleteError) {
      throw new Error(
        `Failed to delete project: ${projectDeleteError.message}`,
      );
    }

    const { error: codeLinesDeleteError } = await supabase
      .from("code_lines")
      .delete()
      .eq("github_repo_url", githubRepoUrl);
    if (codeLinesDeleteError) {
      throw new Error(
        `Failed to delete code lines: ${codeLinesDeleteError.message}`,
      );
    }
    const qdrant = qdrantClient();

    await qdrant.delete(COLLECTION_NAME, {
      filter: {
        must: [{ key: "github_repo_url", match: { value: githubRepoUrl } }],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
