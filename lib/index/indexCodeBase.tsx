import { QdrantClient } from "@qdrant/js-client-rest";
import { buildChunkTable } from "./semantic/code_index/chunk/build_chunk_table";
import { parseCodeBase } from "./semantic/code_index/parseCodeBase";
import OpenAI from "openai";
import type { SupabaseClient } from "@supabase/supabase-js";

import { v4 as uuidv4 } from "uuid";
import { COLLECTION_NAME } from "@/lib/client/qdrant";
import { IndexProgress } from "../types/IndexProgress";
import { ParsedFile } from "./semantic/code_index/parseCodeBase";

import { Chunk } from "../db/schema";
import { lexicalIndex } from "./lexical/lexical_index";

export async function* indexCodeBase(
  rootDir: string,
  qdrantClient: QdrantClient,
  openai: OpenAI,
  supabase: SupabaseClient,
  githubRepoUrl: string,
  projectId: string,
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
  for await (const progress of lexicalIndex(
    parsedFiles,
    supabase,
    githubRepoUrl,
  )) {
    if (progress.stage === "lexical_indexing") {
      yield progress;
    }
    if (progress.stage === "lexical_indexing_done") {
      number_of_indexed_lines = progress.count;
      yield progress;
    }
  }

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

  yield {
    stage: "semantic_indexing",
    count: 0,
    chunk: chunks.at(0)! as Chunk,
    total: total_vectors,
  };
  const EMBED_BATCH = 100;
  const UPSERT_BATCH = 500;

  let points: { id: string; vector: number[]; payload: Chunk }[] = [];

  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const embedBatch = chunks.slice(i, i + EMBED_BATCH);

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: embedBatch.map((c) => c.text),
      encoding_format: "float",
    });

    points.push(
      ...embedBatch.map((chunk, j) => ({
        id: uuidv4(),
        vector: embeddingResponse.data[j].embedding as number[],
        payload: chunk,
      })),
    );

    // upsert whenever we've accumulated enough points
    if (points.length >= UPSERT_BATCH) {
      await qdrantClient.upsert(COLLECTION_NAME, { wait: true, points });
      points = [];
    }

    count += embedBatch.length;
    yield {
      stage: "semantic_indexing",
      chunk: embedBatch.at(-1)!,
      count,
      total: total_vectors,
    };
  }

  // ✅ flush remaining points that never hit the 500 threshold
  if (points.length > 0) {
    await qdrantClient.upsert(COLLECTION_NAME, { wait: false, points });
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      id: projectId,
      github_repo_url: githubRepoUrl,
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

  yield {
    stage: "semantic_indexing_done",
    count,
    total: total_vectors,
  };
}
