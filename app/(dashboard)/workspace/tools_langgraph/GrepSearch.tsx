import { makeAssistantToolUI } from "@assistant-ui/react";
import { Search } from "lucide-react";
import { parseJsonResult, ToolCallShell } from "./toolUiShared";

type GrepSearchArgs = { keyword?: string };

type GrepMatch = {
  filePath: string;
  lineNumber: number;
  lineText: string;
};

export const GrepSearch = makeAssistantToolUI<GrepSearchArgs, string>({
  toolName: "grep_search",
  render: ({ args, result, status, isError }) => {
    const keyword = args.keyword?.toString() ?? "";
    const matches = parseJsonResult<GrepMatch[]>(result);

    const byFile = new Map<string, GrepMatch[]>();
    if (matches) {
      for (const m of matches) {
        const list = byFile.get(m.filePath) ?? [];
        list.push(m);
        byFile.set(m.filePath, list);
      }
    }

    return (
      <ToolCallShell
        icon={<Search className="h-4 w-4 text-amber-400" />}
        title="Lexical search"
        subtitle={keyword ? `“${keyword}” in indexed lines` : "—"}
        status={status}
        accent="amber"
      >
        {status.type === "running" ? (
          <p className="text-zinc-500">Searching the code_lines index…</p>
        ) : isError ? (
          <pre className="whitespace-pre-wrap break-words rounded-md border border-red-500/30 bg-red-950/30 p-2 font-mono text-[11px] text-red-200">
            {typeof result === "string" ? result : String(result)}
          </pre>
        ) : matches && matches.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-500">
              {matches.length} match{matches.length === 1 ? "" : "es"} across{" "}
              {byFile.size} file{byFile.size === 1 ? "" : "s"}
            </p>
            <ul className="space-y-3">
              {[...byFile.entries()].slice(0, 12).map(([file, rows]) => (
                <li key={file} className="rounded-md border border-zinc-800/90 bg-zinc-900/40 p-2">
                  <div className="font-mono text-[11px] text-sky-300/90" title={file}>
                    {file}
                  </div>
                  <ul className="mt-1.5 space-y-1 border-l border-zinc-800 pl-2">
                    {rows.slice(0, 8).map((row, i) => (
                      <li key={`${row.lineNumber}-${i}`} className="text-[10px] leading-snug">
                        <span className="mr-2 inline-block w-8 shrink-0 text-right font-mono text-zinc-600">
                          {row.lineNumber}
                        </span>
                        <span className="font-mono text-zinc-400">{row.lineText.trim()}</span>
                      </li>
                    ))}
                    {rows.length > 8 ? (
                      <li className="pl-10 text-[10px] text-zinc-600">
                        +{rows.length - 8} more in this file
                      </li>
                    ) : null}
                  </ul>
                </li>
              ))}
            </ul>
            {byFile.size > 12 ? (
              <p className="text-[10px] text-zinc-600">
                +{byFile.size - 12} more files with matches (trimmed for display)
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-zinc-500">
            No matches
            {typeof result === "string" && result.length > 0 && !matches ? (
              <span className="mt-2 block font-mono text-[10px] text-zinc-600">
                Raw: {result.slice(0, 400)}
                {result.length > 400 ? "…" : ""}
              </span>
            ) : null}
          </p>
        )}
      </ToolCallShell>
    );
  },
});
