import { Chunk, ChunkType } from "../index/semantic/code_index/chunk/chunk";
import { ParsedFile } from "../index/semantic/code_index/parseCodeBase";

export type IndexProgress =
  | { stage: 'parsing';  file: string; count: number; total: number; parsed: ParsedFile } 
  | { stage: 'chunking'; file: string; count: number, chunk: Chunk}
  | { stage: 'chunking_done'; count: number, chunkTable: Map<string, Chunk>}
  | {stage: 'lexical_indexing'; file: string; count: number, total: number}
  | {stage: 'lexical_indexing_done'; count: number, total: number}
  | { stage: 'semantic_indexing'; chunk: Chunk; count: number, total: number  }
  | { stage: 'semantic_indexing_done'; count: number, total: number }