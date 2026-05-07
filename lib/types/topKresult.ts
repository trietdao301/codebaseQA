import { Chunk } from "../db/schema";

export type TopKResult = {
  id: string;
  score: number;
  payload: Chunk;
};
