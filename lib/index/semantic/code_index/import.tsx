import { Node } from "web-tree-sitter";

/** One resolved import binding in the current file (map key is usually `localName`). */
export type ImportInfo = {
  /** Module specifier: package or relative path (e.g. `"react"`, `./foo`). */
  sourceModule: string
  /** Name exported from that module: a binding, `"default"`, or `"*"` for namespace/wildcard. */
  exportedName: string | "*"
  /** Identifier used in this file (the local binding). */
  localName: string
  /** How this import is written: default, named, namespace, wildcard, or side-effect. */
  importKind: "default" | "named" | "namespace" | "wildcard" | "side-effect"
}
  
export type ImportMap = Map<string, ImportInfo>

function stripImportStringLiteral(text: string): string {
  const q = text[0];
  if ((q === '"' || q === "'") && text.length >= 2 && text.endsWith(q)) {
    return text.slice(1, -1);
  }
  return text;
}

/** `source` is usually under `_from_clause`, not a direct field on `import_statement`. */
function findImportSourceNode(n: Node): Node | null {
  const s = n.childForFieldName("source");
  if (s) return s;
  for (const c of n.namedChildren) {
    const f = findImportSourceNode(c);
    if (f) return f;
  }
  return null;
}

export function absorbImport(
    node: Node,
    fileExtension: string,
    importMap: ImportMap
  ) {
  
    switch (fileExtension) {
  
      case ".tsx":
      case ".ts":
      case ".js":
      case ".jsx": {
        /** `import_clause` is a named child, not `childForFieldName("import_clause")` on the statement. */
        const clause = node.namedChildren.find((c) => c.type === "import_clause");
        const sourceNode = findImportSourceNode(node);
        if (!sourceNode || sourceNode.type !== "string") break;
        const moduleSpecifier = stripImportStringLiteral(sourceNode.text);
        if (clause) {
          absorbJSImportClause(clause, moduleSpecifier, importMap);
        }
        break;
      }
  
      case ".py":
        absorbPythonImport(node, importMap);
        break;
  
      case ".go":
        absorbGoImport(node, importMap);
        break;
  
      case ".java":
        absorbJavaImport(node, importMap);
        break;
    }
  }

function absorbJSImportClause(
    clause: Node,
    moduleSpecifier: string,
    importMap: ImportMap
  ) {
    for (const part of clause.namedChildren) {
      
      // namespace import
      if (part.type === "namespace_import") {
        const id = part.namedChildren.find(x => x.type === "identifier");
        if (!id) continue;
  
        importMap.set(id.text, {
          sourceModule: moduleSpecifier,
          exportedName: "*",
          localName: id.text,
          importKind: "namespace",
        });
      }
  
      // named imports
      else if (part.type === "named_imports") {
        for (const sp of part.namedChildren) {
          if (sp.type !== "import_specifier") continue;
  
          const alias = sp.childForFieldName("alias");
          const nameField = sp.childForFieldName("name");
          if (!nameField) continue;
  
          const importedName = nameField.text;
          const localName = alias?.text ?? importedName;
  
          importMap.set(localName, {
            sourceModule: moduleSpecifier,
            exportedName: importedName,
            localName,
            importKind: "named",
          });
        }
      }
  
      // default import
      else if (part.type === "identifier") {
        importMap.set(part.text, {
          sourceModule: moduleSpecifier,
          exportedName: "default",
          localName: part.text,
          importKind: "default",
        });
      }
    }
  }


  function absorbPythonImport(
    node: Node,
    importMap: ImportMap
  ) {
  
    // import os
    if (node.type === "import_statement") {
      for (const child of node.namedChildren) {
        if (child.type === "aliased_import") {
          const name = child.childForFieldName("name");
          const alias = child.childForFieldName("alias");
  
          if (!name) continue;
  
          const module = name.text;
          const local = alias?.text ?? module;
  
          importMap.set(local, {
            sourceModule: module,
            exportedName: "*",
            localName: local,
            importKind: "namespace",
          });
        }
      }
    }
  
    // from os import path
    else if (node.type === "import_from_statement") {
      const module = node.childForFieldName("module")?.text;
      if (!module) return;
  
      for (const child of node.namedChildren) {
        if (child.type === "aliased_import") {
          const name = child.childForFieldName("name");
          const alias = child.childForFieldName("alias");
  
          if (!name) continue;
  
          const imported = name.text;
          const local = alias?.text ?? imported;
  
          importMap.set(local, {
            sourceModule: module,
            exportedName: imported,
            localName: local,
            importKind: "named",
          });
        }
  
        // from os import *
        if (child.type === "wildcard_import") {
          importMap.set("*", {
            sourceModule: module,
            exportedName: "*",
            localName: "*",
            importKind: "wildcard",
          });
        }
      }
    }
  }


  function absorbJavaImport(node: Node, importMap: ImportMap) {

    if (node.type !== "import_declaration") return;
  
    const path = node.childForFieldName("name");
    if (!path) return;
  
    const full = path.text;
  
    if (full.endsWith(".*")) {
      const module = full.replace(".*", "");
  
      importMap.set("*", {
        sourceModule: module,
        exportedName: "*",
        localName: "*",
        importKind: "wildcard",
      });
  
    } else {
      const parts = full.split(".");
      const local = parts[parts.length - 1];
      const module = parts.slice(0, -1).join(".");
  
      importMap.set(local, {
        sourceModule: module,
        exportedName: local,
        localName: local,
        importKind: "named",
      });
    }
  }

  function absorbGoImport(node: Node, importMap: ImportMap) {

    if (node.type !== "import_spec") return;
  
    const pathNode = node.childForFieldName("path");
    if (!pathNode) return;
  
    const module = pathNode.text.replace(/"/g, "");
  
    const nameNode = node.childForFieldName("name");
  
    if (!nameNode) {
      // import "fmt"
      importMap.set(module, {
        sourceModule: module,
        exportedName: "*",
        localName: module,
        importKind: "namespace",
      });
      return;
    }
  
    const local = nameNode.text;
  
    if (local === ".") {
      importMap.set("*", {
        sourceModule: module,
        exportedName: "*",
        localName: "*",
        importKind: "wildcard",
      });
    } else {
      importMap.set(local, {
        sourceModule: module,
        exportedName: "*",
        localName: local,
        importKind: "namespace",
      });
    }
  }