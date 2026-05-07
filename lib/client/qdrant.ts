import { QdrantClient } from "@qdrant/js-client-rest";

export const COLLECTION_NAME = "chunks";

export const qdrantClient = () => {
  return new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!,
  });
};
