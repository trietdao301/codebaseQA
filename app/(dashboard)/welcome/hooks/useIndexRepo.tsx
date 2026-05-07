// hooks/useIndexRepo.ts
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type StreamEvent = {
  type:
    | "clone_started"
    | "clone_completed"
    | "index_progress"
    | "index_completed"
    | "done"
    | "error";
  message: string;
  repoUrl?: string;
  localPath?: string;
  stage?: string;
  count?: number;
  total?: number;
  file?: string;
};

type PipelineResult = {
  success: boolean;
  message?: string;
  error?: string;
  repoUrl?: string;
  localPath?: string;
};

type LogEntry = {
  id: string;
  tone: "info" | "success" | "error";
  text: string;
};

export function useIndexRepo() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const queryClient = useQueryClient();

  function appendLog(entry: Omit<LogEntry, "id">) {
    setLogs((prev) => [...prev, { ...entry, id: crypto.randomUUID() }]);
  }

  async function indexRepo(url: string) {
    setIsSubmitting(true);
    setResult(null);
    setLogs([]);

    try {
      const response = await fetch("/api/indexRepo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });

      if (!response.ok) {
        let detail = `${response.status} ${response.statusText || ""}`.trim();
        try {
          const payload = (await response.json()) as { error?: string };
          if (typeof payload?.error === "string" && payload.error) {
            detail = payload.error;
          }
        } catch {
          /* body was not JSON */
        }
        throw new Error(detail || "Clone request failed.");
      }

      if (!response.body) {
        throw new Error("No response body from clone API.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sawTerminalEvent = false;

      function ingestEvent(event: StreamEvent) {
        const countText =
          typeof event.count === "number"
            ? ` (${event.count}${typeof event.total === "number" ? `/${event.total}` : ""})`
            : "";
        const fileText = event.file ? ` - ${event.file}` : "";
        const stageText = event.stage ? ` [${event.stage}]` : "";

        if (
          event.type === "clone_completed" ||
          event.type === "index_completed" ||
          event.type === "done"
        ) {
          appendLog({
            tone: "success",
            text: `${event.message}${stageText}${countText}${fileText}`,
          });
        } else if (event.type === "error") {
          sawTerminalEvent = true;
          appendLog({ tone: "error", text: event.message });
          setResult({
            success: false,
            error: event.message,
            repoUrl: event.repoUrl,
            localPath: event.localPath,
          });
        } else {
          appendLog({
            tone: "info",
            text: `${event.message}${stageText}${countText}${fileText}`,
          });
        }

        if (event.type === "done") {
          sawTerminalEvent = true;
          setResult({
            success: true,
            message: "Repository cloned and indexed successfully.",
            repoUrl: event.repoUrl,
            localPath: event.localPath,
          });
          queryClient.invalidateQueries({ queryKey: ["projects"] }); // ← invalidate here
        }
      }

      function flushBufferLines(includePartialTrailingLine: boolean) {
        const lines = buffer.split("\n");
        if (includePartialTrailingLine) {
          buffer = "";
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              ingestEvent(JSON.parse(line) as StreamEvent);
            } catch {
              appendLog({
                tone: "error",
                text: `Bad stream line (${line.slice(0, 120)}${line.length > 120 ? "…" : ""})`,
              });
            }
          }
          return;
        }
        const partial = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            ingestEvent(JSON.parse(line) as StreamEvent);
          } catch {
            appendLog({
              tone: "error",
              text: `Bad stream line (${line.slice(0, 120)}${line.length > 120 ? "…" : ""})`,
            });
          }
        }
        buffer = partial;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (value?.byteLength) {
          buffer += decoder.decode(value, { stream: !done });
        }
        flushBufferLines(false);
        if (done) {
          buffer += decoder.decode();
          flushBufferLines(true);
          break;
        }
      }

      if (!sawTerminalEvent) {
        setResult({
          success: false,
          error:
            "Pipeline ended before success or error — the connection may have been cut (timeout/proxy), or an event line could not be parsed. Check logs above.",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to reach the clone API. Try again.";
      appendLog({ tone: "error", text: message });
      setResult({ success: false, error: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return { indexRepo, isSubmitting, result, logs };
}
