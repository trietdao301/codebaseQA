export interface GrammarInterface {
    getFunctionType(): string;
    getAnonymousFunctionType(): string;
    getMethodTypes(): string[];

    getClassNameField(): string;
    getClassTypes(): string[];


    getInterfaceTypes(): string[];
    getImportTypes(): string[];
    getCallTypes(): string[];
    getMemberTypes(): string[];
    getFunctionNameField(): string;
    getMethodNameField(): string;
    getInterfaceNameField(): string;
    getBodyField(): string;
    getCallFunctionField(): string;
}