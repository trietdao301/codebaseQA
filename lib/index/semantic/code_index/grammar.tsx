import path from "path";
import { Language } from "web-tree-sitter";

export class Grammar {
    static JavaScript: Language;
    static Java: Language;
    static Python: Language;
    static Typescript: Language;
    static Tsx: Language;

    private constructor() {}

    static async create(): Promise<void> {
        [
            Grammar.JavaScript,
            Grammar.Java,
            Grammar.Python,
            Grammar.Typescript,
            Grammar.Tsx,
        ] = await Promise.all([
            Language.load("node_modules/tree-sitter-javascript/tree-sitter-javascript.wasm"),
            Language.load("node_modules/tree-sitter-java/tree-sitter-java.wasm"),
            Language.load("node_modules/tree-sitter-python/tree-sitter-python.wasm"),
            Language.load("node_modules/tree-sitter-typescript/tree-sitter-typescript.wasm"),
            Language.load("node_modules/tree-sitter-typescript/tree-sitter-tsx.wasm"),
        ]);
    }

    static getLanguage(filePath: string): Language | null {
        const map: Record<string, Language> = {
            '.ts': this.Typescript,
            '.tsx': this.Tsx,
            '.py': this.Python,
            '.java': this.Java,
            '.js': this.JavaScript,
        };
        return map[path.extname(filePath)] ?? null;
    }
}