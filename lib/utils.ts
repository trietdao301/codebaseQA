import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLanguageByExtension(extension: string) {
  switch (extension) {
    case ".js":
      return "javascript";
    case ".ts":
      return "typescript";
    case ".tsx":
      return "typescript";
    case ".jsx":
      return "javascript";
    case ".py":
      return "python";
    case ".go":
      return "go";
    case ".rs":
      return "rust";
    case ".java":
      return "java";
    case ".cpp":
      return "cpp";
    case ".c":
      return "c";
    case ".cs":
      return "csharp";
    case ".php":
      return "php";
    case ".ruby":
      return "ruby";
    case ".swift":
      return "swift";
    case ".kotlin":
      return "kotlin";
    case ".scala":
      return "scala";
    case ".sql":
      return "sql";
    case ".xml":
      return "xml";
    case ".yaml":
      return "yaml";
    case ".yml":
      return "yml";
    case ".toml":
      return "toml";
    case ".md":
      return "markdown";
    case ".mdx":
      return "markdown";
    case ".sh":
      return "shell";
    case ".bash":
      return "shell";
    default:
      return "text";
  }
}