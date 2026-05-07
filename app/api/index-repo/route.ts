// app/api/index-repo/route.ts
import { NextResponse } from "next/server";
import { inngest, indexCreated } from "@/app/ingest/ingest_client";
import { getSupabaseServerClient } from "@/lib/client/supabase_server";
import { v4 as uuidv4 } from "uuid";
import { languageCheck } from "./languageCheck";

export async function POST(req: Request) {
  const { repoUrl } = await req.json();
  const runId = uuidv4();
  const isSupportedLanguage = await languageCheck(repoUrl);
  if (!isSupportedLanguage) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Unsupported language. Only Python and TypeScript/JavaScript are supported.",
      },
      { status: 400 },
    );
  }
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("github_repo_url", repoUrl)
    .maybeSingle();

  if (data) {
    return NextResponse.json(
      { success: false, error: "Repository already indexed" },
      { status: 400 },
    );
  }

  // api/index-repo/route.ts
  console.log("Sending inngest event with runId:", runId);
  const projectId = uuidv4();
  await inngest.send(
    indexCreated.create({
      github_repo_url: repoUrl,
      runId,
      projectId: projectId,
    }),
  );
  return NextResponse.json({ success: true, runId });
}
