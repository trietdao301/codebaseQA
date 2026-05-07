import { inspect } from "node:util";

import { openai } from "@/lib/client/openai";
import { TopKResult } from "../../../types/topKresult";

import { Chunk } from "@/lib/db/schema";
import { COLLECTION_NAME, qdrantClient } from "@/lib/client/qdrant";

function formatCaughtError(stage: string, e: unknown): Error {
  // Node fetch (undici) sets `cause` with syscall details (ECONNREFUSED,
  // ENOTFOUND, TLS, timeout). String(e) and `${e}` drop that chain.
  const body =
    e instanceof Error
      ? [
          `${e.name}: ${e.message}`,
          ...(e.stack ? [`stack:\n${e.stack}`] : []),
          ...(e.cause != null
            ? [`cause:\n${inspect(e.cause, { depth: 6 })}`]
            : []),
        ].join("\n")
      : inspect(e, { depth: 6 });

  return new Error(`semanticSearch (${stage}) failed:\n${body}`);
}

export async function semanticSearch(
  question: string,
  githubRepoUrl: string,
): Promise<TopKResult[]> {
  let vector: number[];
  try {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
      encoding_format: "float",
    });
    vector = embedding.data[0].embedding as number[];
  } catch (e) {
    throw formatCaughtError("OpenAI embeddings", e);
  }

  try {
    // Use `query` with raw vector nearest search (filter by repo).
    const qdrant = qdrantClient();
    const points = await qdrant.query(COLLECTION_NAME, {
      query: vector,
      limit: 5,
      with_payload: true,
      filter: {
        must: [
          {
            key: "github_repo_url",
            match: {
              value: githubRepoUrl, // exact match
            },
          },
        ],
      },
    });

    const topKResults: TopKResult[] = points.points.map((p) => ({
      id: p.id.toString(),
      score: (p.order_value as number) ?? 0,
      payload: p.payload as Chunk,
    }));
    return topKResults;
  } catch (e) {
    throw formatCaughtError("Qdrant query", e);
  }
}
