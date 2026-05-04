import { isNestedSymbol } from "../tree_traversal";
import { ParsedFile } from "../parseCodeBase";
import { Query } from "web-tree-sitter";
import path from "path";
import { buildChunk } from "./build_chunk";
import { QUERIES } from "../query";
import { IndexProgress } from "@/lib/types/IndexProgress";
import { Chunk } from "@/lib/db/schema";

export async function* buildChunkTable(
  parsedFiles: ParsedFile[],
  githubRepoUrl: string,
): AsyncGenerator<IndexProgress> {
  const chunkTable: Map<string, Chunk> = new Map();
  let chunk_count = 0;
  for (let i = 0; i < parsedFiles.length; i++) {
    const parsedFile = parsedFiles[i];
    const extension = path.extname(parsedFile.filePath);
    const q = QUERIES[extension];
    if (!q) continue;

    for await (const chunk of buildChunksInFile(
      githubRepoUrl,
      parsedFile,
      q.symbols,
      chunkTable,
    )) {
      yield {
        stage: "chunking",
        file: parsedFile.filePath,
        count: chunk_count++,
        chunk: chunk.chunk,
      };
    }
  }
  yield { stage: "chunking_done", count: chunk_count, chunkTable: chunkTable };
}

type NewChunk = {
  id: string;
  chunk: Chunk;
};

async function* buildChunksInFile(
  githubRepoUrl: string,
  parsedFile: ParsedFile,
  symbolsPattern: string,
  chunkTable: Map<string, Chunk>,
): AsyncGenerator<NewChunk> {
  const query = new Query(parsedFile.grammar, symbolsPattern);
  const matches = query.matches(parsedFile.tree.rootNode);
  const extension = path.extname(parsedFile.filePath);

  // Filter out nested functions, classes
  const topLevelSymbols = matches.filter(({ captures }) => {
    const decl = captures.find((c) => c.name === "decl")?.node;
    return decl && !isNestedSymbol(decl, extension);
  });

  for (const match of topLevelSymbols) {
    const declCapture = match.captures.find((c) => c.name === "decl");
    if (!declCapture) continue;

    const node = declCapture.node;

    const chunk = buildChunk(
      node,
      parsedFile.filePath,
      extension,
      githubRepoUrl,
    );
    if (!chunk) continue;

    if (chunkTable.has(chunk.id)) continue;
    chunkTable.set(chunk.id, chunk);
    yield { id: chunk.id, chunk: chunk };
  }
}
