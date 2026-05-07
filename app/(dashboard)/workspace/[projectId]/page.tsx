"use client";

import { Loader2 } from "lucide-react";
import { use, useEffect, useMemo, useRef, useState } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import path from "path";
import { useLangChainState } from "@assistant-ui/react-langchain";
import { useProjects, useSelectedProjectStore } from "@/app/state/projects";
import { DirectoryNode } from "@/lib/types/DirectoryNode";
import { FileTree } from "@/app/(dashboard)/workspace/DirectoryTree";
import Link from "next/link";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { getLanguageByExtension } from "@/lib/utils";
import { ChatPanel } from "../chat/ChatPanel";
import { useRouter } from "next/navigation";
import { useCodeSnippetStore } from "@/app/state/codeSnippet";

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

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const router = useRouter();
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

  // Selection button state
  const [selectionButton, setSelectionButton] = useState<{
    visible: boolean;
    top: number;
    left: number;
    startLine: number;
    endLine: number;
    code: string;
  }>({ visible: false, top: 0, left: 0, startLine: 0, endLine: 0, code: "" });

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addCodeSnippet } = useCodeSnippetStore();

  useEffect(() => {
    if (!data?.length || projectId == null || projectId === "") return;
    const match = data.find((p) => p.id === projectId);
    if (match) setSelectedProject(match);
  }, [data, projectId, setSelectedProject]);

  useEffect(() => {
    const repoUrl = selectedProject?.github_repo_url;
    if (!repoUrl) return;

    async function loadTree() {
      setLoadingTree(true);
      try {
        const response = await fetch(`/api/codebase/tree`, {
          method: "POST",
          body: JSON.stringify({ repoUrl }),
          headers: { "Content-Type": "application/json" },
        });
        const data = (await response.json()) as TreeResponse;
        if (!data.success || !data.tree) {
          throw new Error(data.error ?? "Unable to load repository tree.");
        }
        setTree(data.tree);
      } catch (error) {
        console.error(error);
        setTree([]);
      } finally {
        setLoadingTree(false);
      }
    }

    loadTree();
  }, [selectedProject?.github_repo_url]);

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
    if (!selectedProject?.github_repo_url) return;
    setSelectedFile(pathToFile);
    ensureExpandedForPath(pathToFile);
    setLoadingFile(true);
    // Hide any existing selection button when switching files
    setSelectionButton({
      visible: false,
      top: 0,
      left: 0,
      startLine: 0,
      endLine: 0,
      code: "",
    });
    try {
      const response = await fetch(`/api/codebase/file`, {
        method: "POST",
        body: JSON.stringify({
          repoUrl: selectedProject.github_repo_url,
          filePath: pathToFile,
        }),
        headers: { "Content-Type": "application/json" },
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

  function handleSaveSnippet() {
    if (!selectedFile || !selectionButton.code.trim()) return;
    const startLine = selectionButton.startLine;
    const endLine = selectionButton.endLine;
    addCodeSnippet({
      id: crypto.randomUUID(),
      code: selectionButton.code,
      file: selectedFile,
      startLine,
      endLine,
    });

    setSelectionButton((s) => ({ ...s, visible: false }));
  }

  function handleEditorMount(
    editorInstance: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) {
    editorRef.current = editorInstance;

    monaco.editor.defineTheme("codebaseqa", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "3a3f4b", fontStyle: "italic" },
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
        "scrollbarSlider.background": "#404040",
        "scrollbarSlider.hoverBackground": "#737373",
        "scrollbarSlider.activeBackground": "#737373",
        "scrollbar.shadow": "#00000000",
      },
    });
    monaco.editor.setTheme("codebaseqa");

    // Show floating button on selection
    editorInstance.onDidChangeCursorSelection(() => {
      const selection = editorInstance.getSelection();
      const text = selection
        ? editorInstance.getModel()?.getValueInRange(selection)
        : "";

      if (text?.trim()) {
        const endPos = editorInstance.getScrolledVisiblePosition(
          selection!.getEndPosition(),
        );
        const editorDom = editorInstance.getDomNode();
        const containerEl = containerRef.current;

        if (endPos && editorDom && containerEl) {
          const editorRect = editorDom.getBoundingClientRect();
          const containerRect = containerEl.getBoundingClientRect();

          // Position button just above the end of the selection
          const top = editorRect.top - containerRect.top + endPos.top - 36;
          const left = editorRect.left - containerRect.left + endPos.left;

          setSelectionButton({
            visible: true,
            top,
            left,
            startLine: selection?.startLineNumber!,
            endLine: selection?.endLineNumber!,
            code: text,
          });
        }
      } else {
        setSelectionButton((s) => ({
          ...s,
          visible: false,
          startLine: 0,
          endLine: 0,
          code: "",
        }));
      }
    });
  }

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
              href={`${selectedProject?.github_repo_url ?? "#"}`}
              className="text-white"
            >
              {selectedProject?.github_repo_url?.split("/").pop() ?? "—"}
            </Link>
          </div>
        </div>
        <button
          onClick={() => router.push("/welcome")}
          className="text-white cursor-pointer text-[12px] border border-radius-sm border-neutral-700 hover:bg-neutral-700 px-2 py-[2px] rounded-sm"
        >
          Exit
        </button>
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
            <div className="flex flex-col gap-1">
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

          {/* Middle — Editor */}
          <ResizablePanel defaultSize="30%" className="min-h-0 overflow-hidden">
            <div className="relative w-full h-full overflow-hidden">
              <div ref={containerRef} className="absolute inset-0">
                {selectedProject?.github_repo_url ? (
                  <>
                    <Editor
                      height="100%"
                      language={getLanguageByExtension(
                        path.extname(selectedFile ?? ""),
                      )}
                      value={fileContent}
                      theme="codebaseqa"
                      onMount={handleEditorMount}
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
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        overviewRulerBorder: false,
                        scrollbar: {
                          vertical: "visible",
                          horizontal: "auto",
                          verticalScrollbarSize: 4,
                          horizontalScrollbarSize: 4,
                          verticalSliderSize: 4,
                          horizontalSliderSize: 4,
                          useShadows: false,
                        },
                      }}
                    />

                    {/* Floating save snippet button */}
                    {selectionButton.visible && (
                      <button
                        className="absolute z-50 flex items-center gap-1.5 px-2 py-[3px] text-[11px] font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-sm shadow-lg transition-colors whitespace-nowrap"
                        style={{
                          top: selectionButton.top,
                          left: selectionButton.left,
                        }}
                        onMouseDown={(e) => {
                          // prevent editor from losing selection on click
                          e.preventDefault();
                          handleSaveSnippet();
                        }}
                      >
                        Add to Chat
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    <Loader2 className="animate-spin" />
                    <span>Loading file...</span>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-neutral-800 w-0" />

          {/* Right Sidebar */}
          <ResizablePanel defaultSize="50%" className="min-h-0">
            <ChatPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
