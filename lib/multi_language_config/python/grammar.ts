import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { GrammarInterface } from "../grammar_interface";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = fs.readFileSync(path.join(__dirname, "python.json"), "utf-8");
const parsed = JSON.parse(raw) as Record<string, PythonGrammarConfig>;

export const pyConfig: PythonGrammarConfig = parsed[".py"];



export class PythonGrammar implements GrammarInterface {
    private function: PyFunction;
    private anonymousFunction: PyAnonymousFunc;
    private method: PyMethod;
    private class: PyClass;
    private import: PyImport;
    private call: PythonCall;
    private member: PyMember;

    constructor() {
        this.function = pyConfig.function;
        this.anonymousFunction = pyConfig.anonymousFunction;
        this.method = pyConfig.method;
        this.class = pyConfig.class;
        this.import = pyConfig.import;
        this.call = pyConfig.call;
        this.member = pyConfig.member;
    }
    getFunctionType(): string {
        return this.function.types;
    }
    getAnonymousFunctionType(): string {
        return this.anonymousFunction.types;
    }
    getMethodTypes(): string[] {
        return this.method.types;
    }
    getClassTypes(): string[] {
        return [this.class.types];
    }
    getInterfaceTypes(): string[] {
        return [];
    }
    getImportTypes(): string[] {
        return this.import.types;
    }
    getCallTypes(): string[] {
        return [this.call.types];
    }
    getMemberTypes(): string[] {
        return [this.member.types];
    }
    getClassNameField(): string {
        return this.class.nameField;
    }
    getFunctionNameField(): string {
        return this.function.nameField;
    }
    getMethodNameField(): string {
        return this.method.nameField;
    }
    getInterfaceNameField(): string {
        throw new Error("Interface name field not supported for Python");
    }
    getBodyField(): string {
        return this.class.bodyField;
    }
    getCallFunctionField(): string {
        return this.call.functionField;
    }
}

export type PythonGrammarConfig = {
    function: PyFunction,
    anonymousFunction: PyAnonymousFunc,
    method: PyMethod,
    class: PyClass,
    import: PyImport,
    call: PythonCall,
    member: PyMember,
}       
type PyFunction = {
    types: string;
    nameField: string;
}
type PyAnonymousFunc = {
    types: string;
    parentTypes: string[];
    nameFromParentField: string;
}
type PyMethod = {
    types: string[];
    nameField: string;
}
type PyClass = {
    types: string;
    nameField: string;
    bodyField: string;
}
type PyImport = {
    types: string[];
}
type PythonCall = {
    types: string;
    functionField: string;
    argumentsField: string;
}
type PyMember = {
    types: string;
    objectField: string;
    propertyField: string;
}