import { Chunk } from "../index/semantic/code_index/chunk/chunk";

export type TopKResult = {
    id: string;
    score: number;
    payload: Chunk;
}