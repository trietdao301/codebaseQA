"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  unstable_createLangGraphStream,
  useLangGraphRuntime,
} from "@assistant-ui/react-langgraph";
import {
  createThread,
  deleteThread,
  getThreadState,
} from "@/lib/chatApi/api";
import { LangChainMessage } from "@assistant-ui/react-langgraph";
import { useEffect, useMemo, useRef } from "react";
import { Client } from "@langchain/langgraph-sdk";
import { useSelectedProjectStore } from "@/app/state/projects";

export const createClient = () => {
  const configuredApiUrl = process.env["NEXT_PUBLIC_LANGGRAPH_API_URL"];
  const apiUrl =
    typeof window !== "undefined"
      ? new URL(configuredApiUrl || "/langgraph", window.location.href).href
      : configuredApiUrl || "/langgraph";
  return new Client({ apiUrl });
};

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const selectedProject = useSelectedProjectStore(
    (state) => state.selectedProject,
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
      const repoUrl = selectedProjectRef.current?.github_repo_url;
      if (!repoUrl) {
        throw new Error("Select a project before starting chat.");
      }
      const { thread_id } = await createThread(repoUrl, client);
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
