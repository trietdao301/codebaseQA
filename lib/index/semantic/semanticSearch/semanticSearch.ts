import { openai } from "@/lib/client/openai";
import { TopKResult } from "../../../types/topKresult";

import { Chunk } from "@/lib/db/schema";
import { COLLECTION_NAME, qdrantClient } from "@/lib/client/qdrant";

export async function semanticSearch(
  question: string,
  githubRepoUrl: string,
): Promise<TopKResult[]> {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
    encoding_format: "float",
  });

  const vector = embedding.data[0].embedding as number[];
  const result = await qdrantClient.query(COLLECTION_NAME, {
    query: vector,
    limit: 5,
    with_payload: true,
    filter: {
      must: [
        {
          key: "github_repo_url",
          match: {
            value: githubRepoUrl,
          },
        },
      ],
    },
  });

  const topKResults: TopKResult[] = result.points.map((e) => ({
    id: e.id.toString(),
    score: e.score,
    payload: e.payload as Chunk,
  }));
  return topKResults;
}
