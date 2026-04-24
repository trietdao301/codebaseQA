import { Language, Parser, Query, Tree } from "web-tree-sitter";
import { Grammar } from "./grammar";
import fs from 'fs';
import path from "path";



export interface ParsedFile {
    filePath: string;
    source: string;
    tree: Tree;
    grammar: Language;
  }
  
// Step 1: Parse the code base and get the AST
export async function parseCodeBase(rootDir: string) : Promise<ParsedFile[]> {
    await Parser.init();

    const parser = new Parser();
    const filePaths = await scan(rootDir);
    const parsedFiles: ParsedFile[] = [];
    await Grammar.create();
    for(const filePath of filePaths){
        const grammar = Grammar.getLanguage(filePath);
        if(grammar == null) continue;
        parser.setLanguage(grammar);
        const source = fs.readFileSync(filePath, 'utf8');
        const tree = parser.parse(source);
        if(tree == null) continue;
        parsedFiles.push({ filePath: filePath, source: source, tree: tree, grammar: grammar});
    }
    return parsedFiles;
}



const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next', '__pycache__', 'build']);
export async function scan (rootDir : string) : Promise<string[]>{
    const filePaths: string[] = [];
    const directory = fs.readdirSync(rootDir, { withFileTypes: true });
    for(const file of directory){
        if(SKIP_DIRS.has(file.name))  continue;
        if(file.name.startsWith('.')) continue;

        const filePath = path.join(rootDir, file.name);
        if(file.isDirectory()){
            const nested = await scan(filePath);
            filePaths.push(...nested); 
        } else {
            filePaths.push(filePath);
        }
    }
    return filePaths;
}
