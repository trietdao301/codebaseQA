import path from "path";
import {
  getClassNameField,
  getClassTypes,
  getFunctionNameField,
  getFunctionType,
  getInterfaceNameField,
  getInterfaceTypes,
  getMethodNameField,
  getMethodTypes,
} from "../../multi_language_config/config";
import { Node } from "web-tree-sitter";

import { getLanguageByExtension } from "@/lib/utils";
import { CLONE_ROOT } from "@/lib/config";
import { v4 as uuidv4 } from "uuid";
import { Chunk, ChunkType } from "@/lib/db/schema";

export function buildChunk(
  node: Node,
  filePath: string,
  extension: string,
  githubRepoUrl: string,
): Chunk {
  const language = getLanguageByExtension(extension);
  const declarationName = buildDeclarationName(node, extension);
  const type = buildType(node, extension);
  const id = uuidv4();
  const firstLineText = node.text.split("\n")[0].trim();
  const relativeFilePath = filePath
    .replace(CLONE_ROOT, "")
    .replace(/^[\\/]/, "");
  const text = buildText(
    relativeFilePath,
    type,
    declarationName,
    firstLineText,
  );
  return {
    id: id,
    type: type,
    language: language,
    github_repo_url: githubRepoUrl,
    relative_file_path: relativeFilePath,
    line_start: node.startPosition.row + 1,
    line_end: node.endPosition.row + 1,
    declaration_name: declarationName,
    docstring: "",
    first_line_text: firstLineText,
    text: text,
  };
}

function buildText(
  relativeFilePath: string,
  type: ChunkType,
  declarationName: string,
  firstLineText: string,
): string {
  return `[FILE_PATH]: ${relativeFilePath} [TYPE]: ${type} [DECLARATION_NAME]: ${declarationName} [FIRST_LINE_TEXT]: ${firstLineText}`;
}

function normalizedRelPath(filePath: string): string {
  const rel = path.relative(process.cwd(), path.resolve(filePath));
  return rel.split(path.sep).join("/");
}

export function getAbsolutePath(
  normalizedPath: string,
  repoPath: string,
): string {
  return path.join(repoPath, normalizedPath);
}

function buildType(node: Node, extension: string): ChunkType {
  if (getClassTypes(extension).includes(node.type)) {
    return "class";
  }
  if (getFunctionType(extension) === node.type) {
    return "function";
  }
  if (getMethodTypes(extension).includes(node.type)) {
    return "method";
  }
  if (getInterfaceTypes(extension).includes(node.type)) {
    return "interface";
  }
  throw new Error(
    `Type not found for node: ${node.type} ${node.startPosition} ${node.endPosition} ${node.text}`,
  );
}

function getClassName(n: Node, ext: string): string {
  const ownName = n.childForFieldName(getClassNameField(ext) ?? "name")?.text;
  if (ownName) return ownName;
  throw new Error(
    `Name field not found for node: ${n.type} ${n.startPosition} ${n.endPosition} ${n.text}`,
  );
}

function getFunctionName(n: Node, ext: string): string {
  const ownName = n.childForFieldName(
    getFunctionNameField(ext) ?? "name",
  )?.text;
  if (ownName) return ownName;
  throw new Error(
    `Name field not found for node: ${n.type} ${n.startPosition} ${n.endPosition} ${n.text}`,
  );
}

function getMethodName(n: Node, ext: string): string {
  const ownName = n.childForFieldName(getMethodNameField(ext))?.text;
  if (ownName) return ownName;
  throw new Error(
    `Name field not found for node: ${n.type} ${n.startPosition} ${n.endPosition} ${n.text}`,
  );
}

function getInterfaceName(n: Node, ext: string) {
  const ownName = n.childForFieldName(getInterfaceNameField(ext))?.text;
  if (ownName) return ownName;
  throw new Error(
    `Name field not found for node: ${n.type} ${n.startPosition} ${n.endPosition} ${n.text}`,
  );
}

function buildDeclarationName(node: Node, extension: string): string {
  if (getClassTypes(extension).includes(node.type)) {
    const declarationName = getClassName(node, extension);
    return declarationName;
  }
  if (getFunctionType(extension) === node.type) {
    const declarationName = getFunctionName(node, extension);
    return declarationName;
  }
  if (getMethodTypes(extension).includes(node.type)) {
    const declarationName = getMethodName(node, extension);
    return declarationName;
  }
  if (getInterfaceTypes(extension).includes(node.type)) {
    const declarationName = getInterfaceName(node, extension);
    return declarationName;
  }

  throw new Error(
    `Declaration name not found for node: ${node.type} ${node.startPosition.row} ${node.endPosition.row}`,
  );
}
