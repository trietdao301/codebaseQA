import { makeAssistantToolUI } from "@assistant-ui/react";
import { FileText } from "lucide-react";
import { ToolCallShell } from "./toolUiShared";

type ReadFileArgs = { relative_file_path?: string };

const PREVIEW_CHARS = 8000;

export const ReadFile = makeAssistantToolUI<ReadFileArgs, string>({
  toolName: "read_file",
  render: ({ args, result, status, isError }) => {
    const rel = args.relative_file_path?.toString() ?? "";
    const text = typeof result === "string" ? result : result != null ? String(result) : "";
    const lines = text ? text.split("\n") : [];
    const truncated = text.length > PREVIEW_CHARS;
    const preview = truncated ? text.slice(0, PREVIEW_CHARS) : text;

    return (
      <ToolCallShell
        icon={<FileText className="h-4 w-4 text-sky-400" />}
        title="Read file"
        subtitle={rel || "—"}
        status={status}
        accent="sky"
      >
        {status.type === "running" ? (
          <p className="text-zinc-500">Fetching file from the repository…</p>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-3 text-[11px] text-zinc-500">
              <span>
                <span className="text-zinc-600">Lines:</span>{" "}
                <span className="text-zinc-300">{lines.length || (text ? 1 : 0)}</span>
              </span>
              <span>
                <span className="text-zinc-600">Characters:</span>{" "}
                <span className="text-zinc-300">{text.length.toLocaleString()}</span>
              </span>
              {truncated ? (
                <span className="text-amber-200/90">
                  Preview first {PREVIEW_CHARS.toLocaleString()} chars
                </span>
              ) : null}
            </div>
            {isError || text.startsWith("Error:") || text.startsWith("File not found") ? (
              <pre
                className={`whitespace-pre-wrap break-words rounded-md border p-2 font-mono text-[11px] leading-relaxed ${
                  isError || text.startsWith("Error:")
                    ? "border-red-500/30 bg-red-950/25 text-red-100"
                    : "border-amber-500/30 bg-amber-950/20 text-amber-100"
                }`}
              >
                {text || "(empty)"}
              </pre>
            ) : (
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md border border-zinc-800 bg-[#0d0f14] p-2.5 font-mono text-[11px] leading-relaxed text-zinc-300 custom-scrollbar">
                {preview || "(empty file)"}
                {truncated ? "\n\n/* …truncated… */" : ""}
              </pre>
            )}
          </div>
        )}
      </ToolCallShell>
    );
  },
});
