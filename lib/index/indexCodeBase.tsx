import { QdrantClient } from "@qdrant/js-client-rest";
import { buildChunkTable } from "./semantic/code_index/chunk/build_chunk_table";
import { parseCodeBase } from "./semantic/code_index/parseCodeBase";
import OpenAI from "openai";
import type { SupabaseClient } from "@supabase/supabase-js";

import { v4 as uuidv4 } from "uuid";
import { COLLECTION_NAME } from "@/lib/client/qdrant";
import { IndexProgress } from "../types/IndexProgress";
import { ParsedFile } from "./semantic/code_index/parseCodeBase";
import { lexicalIndexFile } from "./lexical/lexical_index";
import { Chunk } from "../db/schema";

export async function* indexCodeBase(
  rootDir: string,
  qdrantClient: QdrantClient,
  openai: OpenAI,
  supabase: SupabaseClient,
  githubRepoUrl: string,
): AsyncGenerator<IndexProgress> {
  const parsedFiles: ParsedFile[] = [];
  for await (const progress of parseCodeBase(rootDir)) {
    if (progress.stage === "parsing") {
      if (!progress.parsed) {
        continue;
      }
      parsedFiles.push(progress.parsed);
      yield progress; // forward parsing progress to caller
    }
  }

  // Lexical indexing
  let number_of_indexed_lines = 0;
  for (let i = 0; i < parsedFiles.length; i++) {
    const file: ParsedFile = parsedFiles[i];
    await lexicalIndexFile(file.filePath, file.source, githubRepoUrl, supabase);
    number_of_indexed_lines += file.source.split("\n").length;
    yield {
      stage: "lexical_indexing",
      file: file.filePath,
      count: i + 1,
      total: parsedFiles.length,
    };
  }
  yield {
    stage: "lexical_indexing_done",
    count: parsedFiles.length,
    total: parsedFiles.length,
  };

  // Semantic indexing
  let chunkTable: Map<string, Chunk> = new Map();
  for await (const progress of buildChunkTable(parsedFiles, githubRepoUrl)) {
    if (progress.stage === "chunking") {
      yield progress; // forward chunking progress to caller
    }
    if (progress.stage === "chunking_done") {
      chunkTable = progress.chunkTable;
      yield progress; // forward chunking_done progress to caller
    }
  }

  const chunks = [...chunkTable.values()];
  const total_vectors = chunks.length;
  let count = 0;
  const UPSERT_BATCH = 100;
  const EMBED_BATCH = 100;

  // process in embed batches
  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const embedBatch = chunks.slice(i, i + EMBED_BATCH);

    // embed entire batch in one OpenAI call
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: embedBatch.map((c) => c.text),
      encoding_format: "float",
    });

    const points = embedBatch.map((chunk, j) => ({
      id: uuidv4(),
      vector: embeddingResponse.data[j].embedding as number[],
      payload: chunk,
    }));

    for (let k = 0; k < points.length; k += UPSERT_BATCH) {
      const upsertBatch = points.slice(k, k + UPSERT_BATCH);
      await qdrantClient.upsert(COLLECTION_NAME, {
        wait: false, // ✅ don't block
        points: upsertBatch,
      });
    }

    count += embedBatch.length;
    yield {
      stage: "semantic_indexing",
      chunk: embedBatch.at(-1)!,
      count,
      total: total_vectors,
    };
  }
  const { data, error } = await supabase
    .from("projects")
    .insert({
      repo_url: githubRepoUrl,
      number_of_files: parsedFiles.length,
      number_of_vectors: total_vectors,
      number_of_indexed_lines: number_of_indexed_lines,
    })
    .select()
    .single();
  if (error)
    throw new Error(
      `Supabase insert failed: ${error.message} (code: ${error.code})`,
    );

  yield { stage: "semantic_indexing_done", count: count, total: total_vectors };
}
