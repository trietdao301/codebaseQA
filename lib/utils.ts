import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLanguageByExtension(extension: string): string {
  const languages : Record<string, string> = {".py" : "python", 
    ".ts" : "typescript", 
    ".js" : "javascript", 
    ".tsx" : "typescript", 
    ".jsx" : "javascript"}

  if(!languages[extension]){
    throw new Error(`Language not found for extension: ${extension}`);
  }
  return languages[extension]
}