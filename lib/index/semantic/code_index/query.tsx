// src/extractor/queries.ts
export interface LangQueries {
  functions: string;
  methods: string;
  classes: string;
  interfaces: string;
  /** Backward-compatible aggregate query (all symbol kinds). */
  symbols: string;
}

function combineSymbolQueries(parts: string[]): string {
  return parts.filter((p) => p.trim().length > 0).join("\n");
}

export const QUERIES: Record<string, LangQueries> = {
  ".ts": (() => {
    const functions = `
      (function_declaration                  
        name: (identifier) @name) @decl
    `;
    const methods = `
      (method_definition
        name: (property_identifier) @name) @decl

      (method_signature
        name: (property_identifier) @name) @decl
    `;
    const classes = `
      (class_declaration
        name: (type_identifier) @name) @decl
    `;
    const interfaces = `
      (interface_declaration
        name: (type_identifier) @name) @decl
    `;
    return { functions, methods, classes, interfaces, symbols: combineSymbolQueries([functions, methods, classes, interfaces]) };
  })(),

  ".tsx": (() => {
    const functions = `
      (function_declaration
        name: (identifier) @name) @decl
    `;
    const methods = `
      (method_definition
        name: (property_identifier) @name) @decl

      (method_signature
        name: (property_identifier) @name) @decl
    `;
    const classes = `
      (class_declaration
        name: (type_identifier) @name) @decl
    `;
    const interfaces = `
      (interface_declaration
        name: (type_identifier) @name) @decl
    `;
    return { functions, methods, classes, interfaces, symbols: combineSymbolQueries([functions, methods, classes, interfaces]) };
  })(),

  ".py": (() => {
    const functions = `
      (function_definition
        name: (identifier) @name) @decl
    `;
    const methods = "";
    const classes = `
      (class_definition
        name: (identifier) @name) @decl
    `;
    const interfaces = "";
    return { functions, methods, classes, interfaces, symbols: combineSymbolQueries([functions, methods, classes, interfaces]) };
  })(),

  ".go": (() => {
    const functions = `
      (function_declaration
        name: (identifier) @name) @decl
    `;
    const methods = `
      (method_declaration
        name: (field_identifier) @name) @decl
    `;
    const classes = `
      (type_declaration
        (type_spec name: (type_identifier) @name)) @decl
    `;
    const interfaces = "";
    return { functions, methods, classes, interfaces, symbols: combineSymbolQueries([functions, methods, classes, interfaces]) };
  })(),

  ".java": (() => {
    const functions = "";
    const methods = `
      (method_declaration
        name: (identifier) @name) @decl
    `;
    const classes = `
      (class_declaration
        name: (identifier) @name) @decl
    `;
    const interfaces = `
      (interface_declaration
        name: (identifier) @name) @decl
    `;
    return { functions, methods, classes, interfaces, symbols: combineSymbolQueries([functions, methods, classes, interfaces]) };
  })(),
};
  
