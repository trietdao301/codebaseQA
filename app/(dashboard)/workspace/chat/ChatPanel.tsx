"use client";
import { Thread } from "@/components/thread";
import { VectorSearch } from "../tools_langgraph/VectorSearch";
import { ReadFile } from "../tools_langgraph/ReadFile";
import { GrepSearch } from "../tools_langgraph/GrepSearch";
import { ListDirectory } from "../tools_langgraph/ListDirectory";

import { MyRuntimeProvider } from "./MyRunTimeProvider";

export function ChatPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-neutral-900">
      <MyRuntimeProvider>
        <Thread />
        <VectorSearch />
        <ReadFile />
        <GrepSearch />
        <ListDirectory />
      </MyRuntimeProvider>
    </div>
  );
}
