import { QdrantClient } from "@qdrant/js-client-rest";
import { buildChunkTable } from "./code_index/chunk/build_chunk_table";
import { parseCodeBase } from "./code_index/parseCodeBase";
import OpenAI from "openai";
import { Chunk } from "./code_index/chunk/chunk";
import { v4 as uuidv4 } from 'uuid';



  export async function indexCodeBase(rootDir: string, qdrantClient: QdrantClient, openai: OpenAI){
  const parsedFiles = await parseCodeBase(rootDir);
  const chunkTable = buildChunkTable(parsedFiles);

  for (const chunk of chunkTable.values()) {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk.text,
      encoding_format: "float",
    });
    await qdrantClient.upsert("code_chunks", {
      points: [{
        id: chunk.id,
        vector: embedding.data[0].embedding as number[],
        payload: chunk,
      }],
    });
  }
}