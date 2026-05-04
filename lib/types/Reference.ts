export type Match = {
    file: string;
    line: number;
    column: number;
    kind: 'definition' | 'reference' | 'import';
    snippet: string;
  };