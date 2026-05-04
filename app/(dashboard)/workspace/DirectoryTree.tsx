import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileCode2,
} from "lucide-react";
import { DirectoryNode } from "@/lib/types/DirectoryNode";

export function FileTree({
  nodes,
  expanded,
  onToggleDir,
  onOpenFile,
  selectedPath,
}: {
  nodes: DirectoryNode[];
  expanded: Set<string>;
  onToggleDir: (path: string) => void;
  onOpenFile: (path: string) => void;
  selectedPath: string | null;
}) {
  return (
    <div className="flex flex-col text-[12px] ">
      {nodes.map((node) => {
        if (node.type === "directory") {
          const isOpen = expanded.has(node.path);
          return (
            <div key={node.path}>
              <button
                type="button"
                onClick={() => onToggleDir(node.path)}
                className="flex w-full cursor-pointer items-center gap-1 px-2 py-[3px] text-left text-[#9ca3b0] transition hover:bg-[#21262f] hover:text-[#ffffff]"
              >
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
                <div>📁</div>
                <h1 className="truncate">{node.name}</h1>
              </button>
              {isOpen && node.children && (
                <div className="ml-4 border-l border-zinc-800 pl-2">
                  <FileTree
                    nodes={node.children}
                    expanded={expanded}
                    onToggleDir={onToggleDir}
                    onOpenFile={onOpenFile}
                    selectedPath={selectedPath}
                  />
                </div>
              )}
            </div>
          );
        }

        const isSelected = selectedPath === node.path;
        return (
          <button
            key={node.path}
            type="button"
            onClick={() => onOpenFile(node.path)}
            className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs transition-colors cursor-pointer
                ${
                  isSelected
                    ? "bg-[#4f8ef7]/10 text-[#4f8ef7] border-r-2 border-[#4f8ef7]"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                }`}
          >
            <FileCode2 className="h-4 w-4 text-[#9ca3b0]" />
            <span className="truncate">{node.name}</span>
          </button>
        );
      })}
    </div>
  );
}
