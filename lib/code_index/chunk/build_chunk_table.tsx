import { isNestedSymbol } from "../tree_traversal";
import { ParsedFile } from "../parseCodeBase";
import { Query } from "web-tree-sitter";
import path from "path";
import { Chunk } from "./chunk";
import { buildChunk } from "./build_chunk";
import { QUERIES } from "../query";



export function buildChunkTable(parsedFiles: ParsedFile[]): Map<string, Chunk> { 
  const chunkTable: Map<string, Chunk> = new Map();
  for (const parsedFile of parsedFiles) {
    const extension = path.extname(parsedFile.filePath);
    const q = QUERIES[extension];
    if (!q) continue;

    buildChunksInFile(parsedFile, q.symbols, chunkTable);
  }
  return chunkTable;
}



function buildChunksInFile(
    parsedFile: ParsedFile,
    symbolsPattern: string,
    chunkTable: Map<string, Chunk>,
  ) {

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

      const chunk = buildChunk(node, parsedFile.filePath, extension);
      if (!chunk) continue;

      if(chunkTable.has(chunk.id)) throw new Error(`Chunk already exists for id: ${chunk.id}`);
      
      chunkTable.set(chunk.id, chunk);
    }
  }
