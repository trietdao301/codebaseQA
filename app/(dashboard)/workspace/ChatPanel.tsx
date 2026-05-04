"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Bot, Sparkles, User } from "lucide-react";
import { AssistantRuntimeProvider, ThreadPrimitive } from "@assistant-ui/react";
import { useStreamRuntime } from "@assistant-ui/react-langchain";
import { Thread } from "@/components/thread";
import { VectorSearch } from "./tools_langgraph/VectorSearch";
import { ReadFile } from "./tools_langgraph/ReadFile";
import { GrepSearch } from "./tools_langgraph/GrepSearch";
import { ListDirectory } from "./tools_langgraph/ListDirectory";
import { useSelectedProjectStore } from "@/app/state/projects";
import {
  LangChainMessage,
  unstable_createLangGraphStream,
  useLangGraphRuntime,
} from "@assistant-ui/react-langgraph";
import { Client, ThreadState } from "@langchain/langgraph-sdk";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export const createClient = () => {
  const apiUrl =
    process.env["NEXT_PUBLIC_LANGGRAPH_API_URL"] ||
    (typeof window !== "undefined"
      ? new URL("/api", window.location.href).href
      : "/api");
  return new Client({ apiUrl });
};
export function ChatPanel() {
  const selectedProject = useSelectedProjectStore(
    (state: any) => state.selectedProject,
  );

  // ref always holds latest selectedProject
  const selectedProjectRef = useRef(selectedProject);
  useEffect(() => {
    selectedProjectRef.current = selectedProject;
  }, [selectedProject]);

  const client = useMemo(() => createClient(), []);
  const stream = useMemo(
    () =>
      unstable_createLangGraphStream({
        client,
        assistantId:
          process.env["NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID"] || "agent",
      }),
    [client],
  );

  const runtime = useLangGraphRuntime({
    unstable_allowCancellation: true,
    stream,
    create: async () => {
      // reads from ref, not the closed-over value
      const repoUrl = selectedProjectRef.current?.repo_url;
      console.log("creating thread with repoUrl:", repoUrl);

      const { thread_id } = await client.threads.create({
        graphId: process.env["NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID"] || "agent", // ← associate thread with graph
      });
      await client.threads.updateState(thread_id, {
        values: {
          githubRepoUrl: repoUrl,
        },
      });

      return { externalId: thread_id };
    },
    load: async (externalId) => {
      const state = await client.threads.getState<{
        messages: LangChainMessage[];
        githubRepoUrl: string;
      }>(externalId);
      return {
        messages: state.values.messages,
        interrupts: state.tasks[0]?.interrupts,
      };
    },
  });

  if (!selectedProject) return <div>No project selected</div>;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread />
        <VectorSearch />
        <ReadFile />
        <GrepSearch />
        <ListDirectory />
      </AssistantRuntimeProvider>
    </div>
  );
}
