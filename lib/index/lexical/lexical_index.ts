// lexical-index.ts
// Lexical index for codebase search (Supabase `code_lines` table).

import { CLONE_ROOT } from "@/lib/config";
import { CodeLine } from "@/lib/db/schema";
import type { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { ParsedFile } from "../semantic/code_index/parseCodeBase";
import { IndexProgress } from "@/lib/types/IndexProgress";
export interface SearchResult {
  filepath: string;
  lineNo: number;
  content: string;
}

export async function* lexicalIndex(
  files: ParsedFile[],
  supabase: SupabaseClient,
  github_repo_url: string,
): AsyncGenerator<IndexProgress> {
  const file_in_batch = 3;

  for (let i = 0; i < files.length; i += file_in_batch) {
    const lines: CodeLine[] = [];
    for (let j = i; j < i + file_in_batch; j++) {
      if (j >= files.length) break;
      const file = files[j];
      lines.push(
        ...lexicalIndexFile(file.filePath, file.source, github_repo_url),
      );
    }
    const { error } = await supabase.from("code_lines").insert(lines);
    if (error)
      throw new Error(
        `Supabase insert failed: ${error.message} (code: ${error.code})`,
      );
    yield {
      stage: "lexical_indexing",
      file: files[i].filePath,
      count: i,
      total: files.length,
    };
  }
  yield {
    stage: "lexical_indexing_done",
    count: files.length,
    total: files.length,
  };
}

function lexicalIndexFile(
  filePath: string,
  content: string,
  github_repo_url: string,
): CodeLine[] {
  const lines: CodeLine[] = [];
  const fileLines = content.split("\n");
  const relative_path = filePath.replace(CLONE_ROOT, "").replace(/^[\\/]/, "");
  for (let i = 0; i < fileLines.length; i++) {
    const raw = fileLines[i];
    if (!raw.trim()) continue;
    lines.push({
      id: uuidv4(),
      github_repo_url: github_repo_url,
      relative_path,
      line_no: i + 1,
      content: raw,
    });
  }
  return lines;
}
