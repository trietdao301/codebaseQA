"use client";

import { Loader2 } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import path from "path";
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import {
  useLangChainState,
  useStreamRuntime,
} from "@assistant-ui/react-langchain";
import { useProjects, useSelectedProjectStore } from "@/app/state/projects";
import { DirectoryNode } from "@/lib/types/DirectoryNode";
import { FileTree } from "@/app/(dashboard)/workspace/DirectoryTree";
import Link from "next/link";
import { SiThreedotjs } from "react-icons/si";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { getLanguageByExtension } from "@/lib/utils";
import { ChatPanel } from "../ChatPanel";
type TreeResponse = {
  success: boolean;
  error?: string;
  tree?: DirectoryNode[];
};

type FileResponse = {
  success: boolean;
  error?: string;
  filePath?: string;
  content?: string;
};

function ProgressFeed() {
  const progressEvents = useLangChainState<string[]>("progressEvents") ?? [];
  if (progressEvents.length === 0) return null;

  const turns = progressEvents.reduce<string[][]>((acc, event) => {
    const isTurnStart = event.startsWith("[status] Thinking...");
    if (acc.length === 0 || isTurnStart) {
      acc.push([event]);
      return acc;
    }
    acc[acc.length - 1].push(event);
    return acc;
  }, []);

  return (
    <div className="mb-2 space-y-2">
      {turns.map((turn, turnIndex) => (
        <div
          key={`turn-${turnIndex}`}
          className="rounded-xl border border-zinc-800/90 bg-zinc-950/60 p-2.5"
        >
          <div className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">
            Run {turnIndex + 1}
          </div>
          <div className="space-y-2">
            {turn.map((event, eventIndex) => {
              const content = event.replace(/^\[(status|final)\]\s*/i, "");
              const isFinal = event.startsWith("[final]");
              return (
                <div
                  key={`progress-${turnIndex}-${eventIndex}`}
                  className={`rounded-lg border px-2.5 py-2 text-xs ${
                    isFinal
                      ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                      : "border-amber-400/35 bg-amber-500/10 text-amber-200"
                  }`}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [tree, setTree] = useState<DirectoryNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [loadingTree, setLoadingTree] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const { data } = useProjects();
  const { projectId } = use(params);
  const selectedProject = useSelectedProjectStore(
    (s: any) => s.selectedProject,
  );

  const setSelectedProject = useSelectedProjectStore(
    (s: any) => s.setSelectedProject,
  );

  /** Keep Zustand in sync when opening /workspace/[id] directly (refresh, URL bar). */
  useEffect(() => {
    if (!data?.length || projectId == null || projectId === "") return;
    const match = data.find((p) => p.id === projectId);
    if (match) setSelectedProject(match);
  }, [data, projectId, setSelectedProject]);

  useEffect(() => {
    if (!selectedProject?.repo_url) return; // ← guard here

    async function loadTree() {
      setLoadingTree(true);
      try {
        const response = await fetch(`/api/codebase/tree`, {
          method: "POST",
          body: JSON.stringify({ repoUrl: selectedProject!.repo_url }),
          headers: { "Content-Type": "application/json" },
        });
        const data = (await response.json()) as TreeResponse;
        if (!data.success || !data.tree) {
          throw new Error(data.error ?? "Unable to load repository tree.");
        }
        setTree(data.tree);
      } catch (error) {
        throw error;
      } finally {
        setLoadingTree(false);
      }
    }

    loadTree();
  }, [selectedProject?.repo_url]);

  function ensureExpandedForPath(filePath: string) {
    const parts = filePath.split("/");
    if (parts.length <= 1) return;
    const dirs: string[] = [];
    let current = "";
    for (let i = 0; i < parts.length - 1; i++) {
      current = current ? `${current}/${parts[i]}` : parts[i];
      dirs.push(current);
    }
    setExpandedDirs((prev) => new Set([...prev, ...dirs]));
  }

  async function openFile(pathToFile: string) {
    if (!selectedProject?.repo_url) return;
    setSelectedFile(pathToFile);
    ensureExpandedForPath(pathToFile);
    setLoadingFile(true);
    try {
      const response = await fetch(`/api/codebase/file`, {
        method: "POST",
        body: JSON.stringify({
          repoUrl: selectedProject.repo_url,
          filePath: pathToFile,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = (await response.json()) as FileResponse;
      if (!data.success || data.content === undefined) {
        throw new Error(data.error ?? "Unable to load file.");
      }
      setFileContent(data.content);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to open file.";
      setFileContent(`// ${message}`);
    } finally {
      setLoadingFile(false);
    }
  }

  function toggleDir(pathToDir: string) {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(pathToDir)) {
        next.delete(pathToDir);
      } else {
        next.add(pathToDir);
      }
      return next;
    });
  }

  const editorTitle = useMemo(
    () => selectedFile ?? "Select a file",
    [selectedFile],
  );

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
      {/* TopBar */}
      <div className="flex shrink-0 bg-[#13161b] items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center text-sm gap-10 font-semibold text-white">
          <div className="flex items-center gap-2">
            <div className="p-[4px] bg-[#4f8ef7] rounded-full"></div>
            <h1 className="text-[14px] font-semibold">CodebaseQA</h1>
          </div>
          <div className="flex items-center gap-2 border border-[#2a2f3a] cursor-pointer text-[12px] bg-[#1a1e25] rounded-md px-2 py-[2px]">
            <h2 className="text-zinc-500 font-light">workspace</h2>
            <Link
              href={`${selectedProject?.repo_url ?? "#"}`}
              className="text-white"
            >
              {selectedProject?.repo_url?.split("/").pop() ?? "—"}
            </Link>
          </div>
        </div>
        <div className=" text-white cursor-pointer text-[12px] bg-neutral-800 hover:bg-neutral-700 rounded-md px-2 py-[2px]">
          Exit
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-full min-h-0"
        >
          {/* Left Sidebar */}
          <ResizablePanel
            className="flex h-full min-h-0 flex-col justify-between overflow-y-auto bg-[#13161b] py-[6px] custom-scrollbar"
            defaultSize="10%"
          >
            <div className="flex flex-col gap-1 ">
              <div className="flex items-center justify-between text-[#5c6478] px-4">
                <h1 className="text-[10px] font-semibold uppercase tracking-[2px]">
                  Files
                </h1>
                <div className="mb-2">...</div>
              </div>

              <div>
                {loadingTree ? (
                  <p className="text-sm text-zinc-500">
                    Loading directory tree...
                  </p>
                ) : (
                  <FileTree
                    nodes={tree}
                    expanded={expandedDirs}
                    onToggleDir={toggleDir}
                    onOpenFile={openFile}
                    selectedPath={selectedFile}
                  />
                )}
              </div>
            </div>

            <div>Recent Projects</div>
          </ResizablePanel>

          <ResizableHandle className="bg-neutral-800" />

          {/* Middle */}
          <ResizablePanel defaultSize="30%" className="min-h-0 overflow-hidden">
            <div></div>
            <div className="relative w-full h-full overflow-hidden">
              <div className="absolute inset-0">
                {selectedProject?.repo_url ? (
                  <Editor
                    height="100%"
                    language={getLanguageByExtension(
                      path.extname(selectedFile ?? ""),
                    )}
                    value={fileContent}
                    theme="codebaseqa"
                    onMount={(editor, monaco) => {
                      monaco.editor.defineTheme("codebaseqa", {
                        base: "vs-dark",
                        inherit: true,
                        rules: [
                          {
                            token: "comment",
                            foreground: "3a3f4b",
                            fontStyle: "italic",
                          },
                          { token: "keyword", foreground: "c792ea" },
                          { token: "string", foreground: "c3e88d" },
                          { token: "number", foreground: "f78c6c" },
                          { token: "type", foreground: "ffcb6b" },
                          { token: "type.identifier", foreground: "ffcb6b" },
                          { token: "function", foreground: "82aaff" },
                          { token: "variable", foreground: "e8eaf0" },
                          { token: "delimiter", foreground: "7a8394" },
                          { token: "operator", foreground: "7a8394" },
                        ],
                        colors: {
                          "editor.background": "#13161b",
                          "editor.foreground": "#e8eaf0",
                          "editor.lineHighlightBackground": "#1a1e2560",
                          "editor.lineHighlightBorder": "#1a1e25",
                          "editor.selectionBackground": "#4f8ef728",
                          "editor.inactiveSelectionBackground": "#4f8ef714",
                          "editorLineNumber.foreground": "#2a2f3a",
                          "editorLineNumber.activeForeground": "#496FBA",
                          "editorCursor.foreground": "#4f8ef7",
                          "editorIndentGuide.background1": "#1a1e25",
                          "editorIndentGuide.activeBackground1": "#2a2f3a",
                          "editorBracketMatch.background": "#4f8ef720",
                          "editorBracketMatch.border": "#4f8ef750",
                          "editorGutter.background": "#13161b",
                          "scrollbarSlider.background": "#404040", // neutral-700 equivalent
                          "scrollbarSlider.hoverBackground": "#737373", // neutral-500 equivalent
                          "scrollbarSlider.activeBackground": "#737373",
                          "scrollbar.shadow": "#00000000", // remove shadow
                        },
                      });
                      monaco.editor.setTheme("codebaseqa");
                    }}
                    options={{
                      readOnly: true,
                      fontSize: 13,
                      lineHeight: 22,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      renderLineHighlight: "line",
                      fontFamily: "JetBrains Mono, Fira Code, monospace",
                      fontLigatures: true,
                      padding: { top: 16 },
                      wordWrap: "on",
                      overviewRulerLanes: 0, // ← remove the overview ruler gutter
                      hideCursorInOverviewRuler: true,
                      overviewRulerBorder: false, // ← removes right border that causes flicker
                      scrollbar: {
                        vertical: "visible",
                        horizontal: "auto",
                        verticalScrollbarSize: 4,
                        horizontalScrollbarSize: 4,
                        verticalSliderSize: 4,
                        horizontalSliderSize: 4,
                        useShadows: false, // ← prevents shadow recalculation on resize
                      },
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    <Loader2 className="animate-spin" />
                    <span>Loading file...</span>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-neutral-800" />

          {/* Right Sidebar */}
          <ResizablePanel defaultSize="50%" className="min-h-0">
            <ChatPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
