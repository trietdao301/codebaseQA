import { ChatAnthropic } from "@langchain/anthropic";
import { StructuredToolInterface, Tool, tool } from "@langchain/core/tools";
import * as z from "zod";
import fs from "fs";
import path from "path";

import { grepSearchInDirectory } from "./grep_search_in_directory";
import { APP_ROOT, CLONE_ROOT } from "../config";
import { buildDirectoryTree } from "../buildTree";
import { semanticSearch } from "../index/semantic/semanticSearch/semanticSearch";
import { model } from "../client/openai";
import { TopKResult } from "../types/topKresult";
import { RunnableConfig } from "@langchain/core/runnables";
import { Octokit } from "@octokit/rest";
import { getOctokitServerClient } from "../client/octokit_server";

// Define tools
const vector_search: StructuredToolInterface = tool(
  async ({ question }: { question: string }, config: RunnableConfig) => {
    const githubRepoUrl = config?.configurable?.githubRepoUrl;
    if (!githubRepoUrl) {
      throw new Error(
        "githubRepoUrl is required in the config in vector_search tool",
      );
    }
    const topKResults: TopKResult[] = await semanticSearch(
      question,
      githubRepoUrl,
    );

    return JSON.stringify(topKResults);
  },
  {
    name: "vector_search",
    description: "Search top k chunks that are most relevant to the question",
    schema: z.object({
      question: z.string().describe("The question to search the codebase for"),
    }),
  },
);

function parseGithubUrl(github_url: string): { owner: string; repo: string } {
  const match = github_url.match(
    /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/|$)/,
  );
  if (!match) throw new Error(`Invalid GitHub URL: ${github_url}`);
  return { owner: match[1], repo: match[2] };
}

const read_file: StructuredToolInterface = tool(
  async (
    { relative_file_path }: { relative_file_path: string },
    config: RunnableConfig,
  ) => {
    const octokitServerClient = await getOctokitServerClient();
    if (!octokitServerClient) {
      throw new Error("octokitServerClient is undefined in read_file tool");
    }
    const githubRepoUrl = config?.configurable?.githubRepoUrl;
    if (!githubRepoUrl) {
      throw new Error(
        "githubRepoUrl is required in the config in read_file tool",
      );
    }

    const normalizedPath = relative_file_path
      .replace(/\\/g, "/")
      .replace(/^\//, "");

    const { owner, repo } = parseGithubUrl(githubRepoUrl);

    try {
      const { data } = await octokitServerClient.rest.repos.getContent({
        owner,
        repo,
        path: normalizedPath,
      });

      if (Array.isArray(data)) {
        return `Path points to a directory, not a file: ${normalizedPath}`;
      }

      if (data.type !== "file") {
        return `Expected a file but got: ${data.type}`;
      }

      return Buffer.from(data.content, "base64").toString("utf-8");
    } catch (error: any) {
      if (error.status === 404) {
        return `File not found: ${relative_file_path}. You MUST call list_files_and_directories_in_codebase first to find the correct path, then call read_file again with the exact path.`;
      }
      return `Error: ${error.message}. You MUST stop answering and exit the program immediately and report the error to the user, don't call any tools.`;
    }
  },
  {
    name: "read_file",
    description:
      "Read entire file content from an exact, verified relative path. Requires correct extension.",
    schema: z.object({
      relative_file_path: z
        .string()
        .describe(
          "Relative path of the file to read only (e.g. src/index.ts, lib/auth/jwt.tsx, auth/authenticator.py)",
        ),
    }),
  },
);

const grep_search: StructuredToolInterface = tool(
  async (
    {
      keyword,
    }: {
      keyword: string;
    },
    config,
  ) => {
    const githubRepoUrl = config?.configurable?.githubRepoUrl;
    if (!githubRepoUrl) {
      throw new Error(
        "githubRepoUrl is required in the config in grep_search tool",
      );
    }

    const results = await grepSearchInDirectory(githubRepoUrl, keyword);
    return JSON.stringify(results);
  },
  {
    name: "grep_search",
    description: "Search exact keyword from a directory using grep",
    schema: z.object({
      keyword: z.string().describe("The keyword or pattern to search for"),
    }),
  },
);

const list_files_and_directories_in_codebase: StructuredToolInterface = tool(
  async ({}: {}, config: RunnableConfig) => {
    // ← input first, config second
    const octokitServerClient = await getOctokitServerClient();
    if (!octokitServerClient) {
      throw new Error(
        "octokit is required in the config in list_files_and_directories_in_codebase tool",
      );
    }
    const githubRepoUrl = config?.configurable?.githubRepoUrl;
    if (!githubRepoUrl) {
      throw new Error(
        "githubRepoUrl is required in the config in list_files_and_directories_in_codebase tool",
      );
    }

    const tree = await buildDirectoryTree(octokitServerClient, githubRepoUrl);
    return JSON.stringify(tree);
  },
  {
    name: "list_files_and_directories_in_codebase",
    description: "Explore all files and directory in the codebase",
    schema: z.object({}), // ← empty schema, no input needed since everything comes from config
  },
);

// Augment the LLM with tools
export const toolsByName: Record<string, StructuredToolInterface> = {
  [vector_search.name]: vector_search,
  [read_file.name]: read_file,
  [grep_search.name]: grep_search,
  [list_files_and_directories_in_codebase.name]:
    list_files_and_directories_in_codebase,
};
