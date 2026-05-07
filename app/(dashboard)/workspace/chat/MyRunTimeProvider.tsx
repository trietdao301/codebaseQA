"use client";

import { AssistantCloud, AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  unstable_createLangGraphStream,
  useLangGraphRuntime,
} from "@assistant-ui/react-langgraph";
import {
  createThread,
  deleteThread,
  getAllThreads,
  getThreadState,
} from "@/lib/chatApi/api";
import { LangChainMessage } from "@assistant-ui/react-langgraph";
import { useEffect, useMemo, useRef } from "react";
import { Client } from "@langchain/langgraph-sdk";
import { useSelectedProjectStore } from "@/app/state/projects";
import { ThreadList } from "@/components/thread-list";

export const createClient = () => {
  const apiUrl =
    process.env["NEXT_PUBLIC_LANGGRAPH_API_URL"] ||
    (typeof window !== "undefined"
      ? new URL("/api", window.location.href).href
      : "/api");
  return new Client({ apiUrl });
};

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const selectedProject = useSelectedProjectStore(
    (state: any) => state.selectedProject,
  );
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
    stream,
    create: async () => {
      const { thread_id } = await createThread(
        selectedProjectRef.current?.github_repo_url,
        client,
      );
      return { externalId: thread_id };
    },
    load: async (externalId) => {
      const thread = await getThreadState(externalId, client);
      return {
        messages:
          (thread.values as { messages?: LangChainMessage[] }).messages ?? [],
      };
    },
    delete: async (externalId) => {
      await deleteThread(externalId, client);
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
