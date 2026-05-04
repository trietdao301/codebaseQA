// lexical-index.ts
// Lexical index for codebase search (Supabase `code_lines` table).

import { CLONE_ROOT } from "@/lib/config";
import { CodeLine } from "@/lib/db/schema";
import type { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
export interface SearchResult {
  filepath: string;
  lineNo: number;
  content: string;
}

export async function lexicalIndexFile(
  filePath: string,
  content: string,
  github_repo_url: string,
  supabase: SupabaseClient,
): Promise<void> {
  const lines: CodeLine[] = [];
  const fileLines = content.split("\n");
  const relative_path = filePath.replace(CLONE_ROOT, "").replace(/^[\\/]/, "");
  for (let i = 0; i < fileLines.length; i++) {
    const raw = fileLines[i];
    if (!raw.trim()) continue;
    lines.push({
      id: uuidv4(),
      repo: github_repo_url,
      relative_path,
      line_no: i + 1,
      content: raw,
    });
  }

  const { error } = await supabase.from("code_lines").insert(lines);
  if (error)
    throw new Error(
      `Supabase insert failed: ${error.message} (code: ${error.code})`,
    );
}
