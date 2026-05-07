import { makeAssistantToolUI } from "@assistant-ui/react";
import { Sparkles } from "lucide-react";
import type { Chunk } from "@/lib/db/schema";
import type { TopKResult } from "@/lib/types/topKresult";
import { parseJsonResult, ToolCallShell } from "./toolUiShared";

type VectorSearchArgs = { question?: string };

export const VectorSearch = makeAssistantToolUI<VectorSearchArgs, string>({
  toolName: "vector_search",
  render: ({ args, result, status, isError }) => {
    const question = args.question?.toString() ?? "";
    const hits = parseJsonResult<TopKResult[]>(result);

    return (
      <ToolCallShell
        icon={<Sparkles className="h-4 w-4 text-violet-400" />}
        title="Semantic search"
        subtitle={question || "—"}
        status={status}
        accent="violet"
      >
        {status.type === "running" ? (
          <p className="text-zinc-500">Embedding query and searching the index…</p>
        ) : isError ? (
          <pre className="whitespace-pre-wrap break-words rounded-md border border-red-500/30 bg-red-950/30 p-2 font-mono text-[11px] text-red-200">
            {typeof result === "string" ? result : String(result)}
          </pre>
        ) : hits && hits.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-500">
              {hits.length} chunk{hits.length === 1 ? "" : "s"} ranked by relevance
            </p>
            <ul className="space-y-2">
              {hits.map((hit, i) => {
                const p = hit.payload as Chunk;
                const path = p.relative_file_path ?? "—";
                const symbol = p.declaration_name ?? p.type ?? "chunk";
                const preview =
                  p.first_line_text?.trim() ||
                  p.text?.slice(0, 220).trim() ||
                  "(no preview)";
                const score =
                  typeof hit.score === "number" && !Number.isNaN(hit.score)
                    ? hit.score.toFixed(3)
                    : "—";
                return (
                  <li
                    key={hit.id ?? i}
                    className="rounded-md border border-zinc-800/90 bg-zinc-900/50 p-2.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-mono text-[11px] text-sky-300/95" title={path}>
                        {path}
                      </span>
                      <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                        score {score}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-400">
                      <span className="text-zinc-500">Symbol:</span>{" "}
                      <span className="text-zinc-200">{symbol}</span>
                      {p.language ? (
                        <>
                          {" "}
                          <span className="text-zinc-600">·</span>{" "}
                          <span className="text-zinc-500">{p.language}</span>
                        </>
                      ) : null}
                      {p.line_start != null && p.line_end != null ? (
                        <>
                          {" "}
                          <span className="text-zinc-600">·</span> L{p.line_start}–{p.line_end}
                        </>
                      ) : null}
                    </div>
                    <p className="mt-1.5 line-clamp-3 font-mono text-[10px] leading-relaxed text-zinc-500">
                      {preview}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="text-zinc-500">
            No vector hits returned
            {typeof result === "string" && result.length > 0 ? (
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
