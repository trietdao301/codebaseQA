// import { Tree, Node } from "web-tree-sitter";

// import { Match } from "../types/Reference";
// import fs from "fs";
// import { parseCodeBase } from "../index/semantic/code_index/parseCodeBase";

// export async function findAllReferences(
//   symbol: string,
//   rootDir: string,
// ): Promise<Match[]> {
//   const results: Match[] = [];

//   for await (const progress of parseCodeBase(rootDir)) {
//     if (progress.stage !== "parsing") continue;

//     const matches = findInFile(
//       progress.parsed.tree,
//       progress.parsed.source,
//       progress.file,
//       symbol,
//     );
//     results.push(...matches);
//   }

//   return results;
// }

// function findInFile(
//   tree: Tree,
//   source: string,
//   filePath: string,
//   symbolName: string,
// ): Match[] {
//   const matches: Match[] = [];
//   const lines = source.split("\n");
//   function walk(node: Node) {
//     // definitions — function/class/variable declarations
//     const isDefinition =
//       node.type === "function_declaration" ||
//       node.type === "class_declaration" ||
//       node.type === "lexical_declaration" || // const/let
//       node.type === "variable_declarator" ||
//       node.type === "method_definition" ||
//       node.type === "interface_declaration" ||
//       node.type === "type_alias_declaration";

//     if (isDefinition) {
//       const nameNode = node.childForFieldName("name");
//       if (nameNode?.text === symbolName) {
//         matches.push({
//           file: filePath,
//           line: nameNode.startPosition.row + 1,
//           column: nameNode.startPosition.column,
//           kind: "definition",
//           snippet: lines[nameNode.startPosition.row].trim(),
//         });
//       }
//     }

//     // imports — import { symbolName } from '...'
//     if (node.type === "import_specifier") {
//       const nameNode = node.childForFieldName("name");
//       if (nameNode?.text === symbolName) {
//         matches.push({
//           file: filePath,
//           line: nameNode.startPosition.row + 1,
//           column: nameNode.startPosition.column,
//           kind: "import",
//           snippet: lines[nameNode.startPosition.row].trim(),
//         });
//       }
//     }

//     // references — any identifier usage that isn't a definition
//     if (node.type === "identifier" && node.text === symbolName) {
//       const parent = node.parent;
//       const isNameOfDefinition =
//         parent?.childForFieldName("name") === node &&
//         (parent?.type === "function_declaration" ||
//           parent?.type === "class_declaration" ||
//           parent?.type === "variable_declarator" ||
//           parent?.type === "method_definition");

//       if (!isNameOfDefinition) {
//         matches.push({
//           file: filePath,
//           line: node.startPosition.row + 1,
//           column: node.startPosition.column,
//           kind: "reference",
//           snippet: lines[node.startPosition.row].trim(),
//         });
//       }
//     }

//     for (const child of node.children) walk(child);
//   }

//   walk(tree.rootNode);
//   return matches;
// }
