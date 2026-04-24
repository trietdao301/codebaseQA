import { buildChunkTable } from "./code_index/chunk/build_chunk_table";
import { parseCodeBase } from "./code_index/parseCodeBase";




export async function indexCodeBase(rootDir: string){
  const parsedFiles = await parseCodeBase(rootDir);
  const chunkTable = buildChunkTable(parsedFiles);

  return undefined
}