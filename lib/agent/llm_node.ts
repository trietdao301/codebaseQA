import { SystemMessage } from "@langchain/core/messages";
import { GraphNode } from "@langchain/langgraph";
import { MessagesState } from "./state";
import { modelWithTools } from "./agent";

const STRATEGY: Record<string, string> = {
  architecture:
    "Start with list_files_and_directories to understand the project structure, then read key entry-point files to understand what the project does and how it is organized.",
  location:
    "Start with grep_search if you know a specific symbol or keyword, otherwise use vector_search to find the most relevant area of the codebase.",
  explanation:
    "Start with vector_search to find the most relevant chunks, use read_file for full context of a specific file, and use find_all_references if a symbol is used across multiple files.",
  simple:
    "Answer the user directly and conversationally. Do NOT call any tools.",
};
const SYSTEM_PROMPT = (category: string, githubRepoUrl: string) => `
You are a codebase QA assistant. You help users understand the following github repository with url as ${githubRepoUrl}

You have access to the following tools:
- list_files_and_directories_in_codebase: get the full file/folder structure
- vector_search: semantically search for relevant code chunks
- read_file: read the full content of a specific file
- grep_search: search for an exact keyword or pattern across files
- find_all_references: find everywhere a symbol is used in the codebase

## Question Category
The user's question has been classified as: **${category}**

## Strategy
${STRATEGY[category]}

## Rules
- Do NOT modify, suggest edits, or write new code. This is a read-only QA task.
- Do NOT guess file paths — use list_files_and_directories or grep_search to find them first.
- Before calling read_file, you MUST have an exact file path with the correct extension from tool evidence.
- If unsure between extensions (e.g. .ts vs .tsx), call list_files_and_directories_in_codebase or grep_search first to verify.
- Never "try a likely extension" in read_file. Use verified paths only.
- If read_file returns "File not found", you MUST call list_files_and_directories_in_codebase next to locate the exact path, then retry read_file with that exact path.
- Do NOT hallucinate code or behavior — only answer based on what you find in the codebase.
- If you cannot find the answer after using the appropriate tools, say so honestly.
- Keep answers concise and grounded in the actual code you read.
`;

export const llmCall: GraphNode<typeof MessagesState> = async (
  state,
  config,
) => {
  const category = state.category;
  console.log("full state:", JSON.stringify(state, null, 2));
  console.log("category:", category);
  const githubRepoUrl = state.githubRepoUrl;
  if (!githubRepoUrl) {
    throw new Error("githubRepoUrl is required in llmCall");
  }
  // const toolConfig = {
  //   ...config,
  //   configurable: {
  //     ...config?.configurable,
  //     githubRepoUrl,
  //   },
  // };

  const response = await modelWithTools.invoke(
    [
      new SystemMessage(SYSTEM_PROMPT(category, githubRepoUrl)),
      ...state.messages,
    ], // ← pass here
  );
  const isFinal = !response.tool_calls?.length;

  return {
    messages: [response],
    llmCalls: 1,
    streamResponse: isFinal
      ? `[final] ${typeof response.content === "string" ? response.content : ""}`
      : "[status] Thinking...",
    progressEvents: [
      isFinal
        ? `[final] ${typeof response.content === "string" ? response.content : ""}`
        : "[status] Thinking...",
    ],
  };
};
