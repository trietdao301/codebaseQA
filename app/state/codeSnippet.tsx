import { create } from "zustand";

export interface CodeSnippet {
  id: string;
  code: string;
  file: string;
  startLine: number;
  endLine: number;
}
export interface CodeSnippetState {
  codeSnippets: CodeSnippet[];
  addCodeSnippet: (codeSnippet: CodeSnippet) => void;
  removeCodeSnippet: (id: string) => void;
  clearCodeSnippets: () => void;
}

export const useCodeSnippetStore = create<CodeSnippetState>()((set) => ({
  codeSnippets: [],
  addCodeSnippet: (codeSnippet: CodeSnippet) =>
    set((state) => ({ codeSnippets: [...state.codeSnippets, codeSnippet] })),
  removeCodeSnippet: (id: string) =>
    set((state) => ({
      codeSnippets: state.codeSnippets.filter((snippet) => snippet.id !== id),
    })),
  clearCodeSnippets: () => set({ codeSnippets: [] }),
}));
