import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { GrammarInterface } from "../grammar_interface";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = fs.readFileSync(path.join(__dirname, "ts.json"), "utf-8");
const parsed = JSON.parse(raw) as Record<string, TSGrammarConfig>;
export const tsConfig: TSGrammarConfig = parsed[".ts"];


export class TSGrammar implements GrammarInterface {
    private function: TsFunction;
    private anonymousFunction: TsAnonymousFunc;
    private method: TsMethod;
    private class: TsClass;
    private interface: TsInterface;
    private import: TsImport;
    private call: TsCall;
    private member: TsMember;

    constructor() {
        this.function = tsConfig.function;
        this.anonymousFunction = tsConfig.anonymousFunction;
        this.method = tsConfig.method;
        this.class = tsConfig.class;
        this.interface = tsConfig.interface;
        this.import = tsConfig.import;
        this.call = tsConfig.call;
        this.member = tsConfig.member;
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
        return this.class.types;
    }
    getInterfaceTypes(): string[] {
        return [this.interface.types];
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
        return this.interface.nameField;
    }
    getBodyField(): string {
        return this.class.bodyField;
    }
    getCallFunctionField(): string {
        return this.call.functionField;
    }
}
export type TSGrammarConfig = {
    function: TsFunction,
    anonymousFunction: TsAnonymousFunc,
    method: TsMethod,
    class: TsClass,
    interface: TsInterface,
    import: TsImport,
    call: TsCall,
    member: TsMember,
  }
  type TsFunction = {
    types: string;
    nameField: string;
  }
  type TsAnonymousFunc = {
    types: string;
    parentTypes: string[];
    nameFromParentField: string;
  }
  type TsMethod = {
    types: string[];
    nameField: string;
  }
  type TsClass = {
    types: string[];
    nameField: string;
    bodyField: string;
  }
  type TsInterface = {
    types: string;
    nameField: string;
  }
  type TsImport = {
    types: string[];
  }
  type TsCall = {
    types: string;
    functionField: string;
    argumentsField: string;
  }
  type TsMember = {
    types: string;
    objectField: string;
    propertyField: string;
  }