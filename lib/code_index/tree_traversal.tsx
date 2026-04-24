import { Node } from "web-tree-sitter";
import { getClassTypes, getFunctionType, getInterfaceTypes, getMethodTypes } from "./multi_language_config/config";


export function collectDescendants(
    node: Node,
    predicate: (n: Node) => boolean,
  ): Node[] {
    const results: Node[] = [];
    function visit(n : Node) :void {
      if (predicate(n)) {
        results.push(n);
      }
      for (const child of n.namedChildren) {
        visit(child);
      }
    }
    visit(node);
    return results;
  }

export function selectDescendant(root: Node, predicate: (n: Node) => boolean) : Node | null{
    function visit(n : Node) : Node | null {
      if(predicate(n)) return n;
      for(const child of n.namedChildren) {
        const result = visit(child);
        if(result != null) return result;
      }
      return null;
    }
    if(predicate(root)) return root;
    return visit(root);
}

export function isNestedFunction(node: Node, ext: string) : boolean {
  let p = node.parent as Node | null;
  while (p) {
    const allFunctionTypes = getFunctionType(ext);
    if (allFunctionTypes === p.type) {
      return true;
    }
    p = p.parent;
  }
  return false;
}

export function isNestedClass(node: Node, ext: string) : boolean {
  let p = node.parent as Node | null;
  while (p) {
    const allClassTypes = getClassTypes(ext);
    if (allClassTypes.includes(p.type)) {
      return true;
    }
    p = p.parent;
  }
  return false;
}

export function isNestedSymbol(node: Node, ext: string) : boolean {
  if(getClassTypes(ext).includes(node.type)) return isNestedClass(node, ext);
  if(node.type === getFunctionType(ext)) return isNestedFunction(node, ext);
  if(getInterfaceTypes(ext).includes(node.type)) return false;
  if(getMethodTypes(ext).includes(node.type)) return false;
  return false;
}