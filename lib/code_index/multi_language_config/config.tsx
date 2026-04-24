import { pyConfig, PythonGrammarConfig } from "./python/grammar";
import { tsConfig, TSGrammarConfig } from "./typescript/grammar";
import { GrammarInterface } from "./grammar_interface";
import { PythonGrammar } from "./python/grammar";
import { TSGrammar } from "./typescript/grammar";



const pythonGrammar = new PythonGrammar();
const tsGrammar = new TSGrammar();

const grammarConfig: Record<string, GrammarInterface> = {
    ".py": pythonGrammar,
    ".ts": tsGrammar,
    ".js": tsGrammar,
    ".tsx": tsGrammar,
}


export function getFunctionType(ext: string): string {
        return grammarConfig[ext].getFunctionType();
    }
export function getAnonymousFunctionType(ext: string): string {
        return grammarConfig[ext].getAnonymousFunctionType();
    }
export function getMethodTypes(ext: string): string[] {
        return grammarConfig[ext].getMethodTypes();
    }
export function getClassTypes(ext: string): string[] {
        return grammarConfig[ext].getClassTypes();
    }
export function getInterfaceTypes(ext: string): string[] {
        return grammarConfig[ext].getInterfaceTypes();
    }
export function getImportTypes(ext: string): string[] {
        return grammarConfig[ext].getImportTypes();
    }
export function getCallTypes(ext: string): string[] {
        return grammarConfig[ext].getCallTypes();
    }
export function getMemberTypes(ext: string): string[] {
        return grammarConfig[ext].getMemberTypes();
    }
export function getClassNameField(ext: string): string {
        return grammarConfig[ext].getClassNameField();
    }
export function getFunctionNameField(ext: string): string {
        return grammarConfig[ext].getFunctionNameField();
    }
export function getMethodNameField(ext: string): string {
        return grammarConfig[ext].getMethodNameField();
    }
export function getInterfaceNameField(ext: string): string {
        return grammarConfig[ext].getInterfaceNameField();
    }
export function getBodyField(ext: string): string {
        return grammarConfig[ext].getBodyField();
    }
export function getCallFunctionField(ext: string): string {
        return grammarConfig[ext].getCallFunctionField();
    }















