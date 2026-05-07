import { rgPath } from "@vscode/ripgrep";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getSupabaseServiceClient } from "../client/supabase_service";
import { CodeLine } from "../db/schema";

export type GrepMatch = {
  filePath: string;
  lineNumber: number;
  lineText: string;
};
const execFileAsync = promisify(execFile);

export async function grepSearchInDirectory(
  githubRepoUrl: string,
  keyword: string,
): Promise<GrepMatch[]> {
  try {
    const matches: GrepMatch[] = [];

    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("code_lines")
      .select("*")
      .like("content", `%${keyword}%`)
      .eq("github_repo_url", githubRepoUrl);

    if (error) {
      throw error;
    }
    const rows = (data ?? []) as CodeLine[];
    const result: CodeLine[] = rows.map((line) => ({
      id: line.id,
      content: line.content,
      relative_path: line.relative_path,
      line_no: line.line_no,
      github_repo_url: line.github_repo_url,
    }));

    for (const line of result) {
      matches.push({
        filePath: line.relative_path,
        lineNumber: line.line_no,
        lineText: line.content,
      });
    }
    return matches;
  } catch (error: any) {
    throw error;
  }
}
