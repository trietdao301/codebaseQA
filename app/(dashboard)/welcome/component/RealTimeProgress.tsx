// RealtimeProgress.tsx
"use client";
import { useRealtime } from "inngest/react";
import { schema } from "@/app/ingest/schema";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  runId: string;
  onDone: () => void;
};

export function RealTimeProgress({ runId, onDone }: Props) {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const ch = useMemo(() => schema({ runId }), [runId]);
  const topics = useMemo(() => ["events"] as const, []); // removed "status" — everything is in "events" now
  const getToken = useCallback(
    () => fetch(`/api/realtime-token?runId=${runId}`).then((r) => r.json()),
    [runId],
  );

  const { messages, connectionStatus, runStatus } = useRealtime({
    channel: ch,
    topics,
    token: getToken,
    bufferInterval: 100,
  });

  useEffect(() => {
    console.log("RealtimeProgress mounted, runId:", runId);
    return () => console.log("RealtimeProgress UNMOUNTED");
  }, []);

  const eventMessages = useMemo(
    () =>
      messages.all
        .filter(
          (message) => message.kind === "data" && message.topic === "events",
        )
        .map((message) => message.data),
    [messages.all],
  );

  const latestEvent = eventMessages.at(-1);
  const latestTone = latestEvent?.tone ?? "info";
  const statusLabel = latestEvent?.status ?? "idle";

  const toneDotColor: Record<string, string> = {
    info: "bg-blue-400",
    success: "bg-green-400",
    error: "bg-red-400",
    warning: "bg-amber-400",
  };

  const visibleEventMessages = showAllEvents
    ? [...eventMessages].reverse()
    : [...eventMessages].slice(-8).reverse();

  const isDone = eventMessages.some((m) => m.tone === "success");
  const isFailed = eventMessages.some((m) => m.tone === "error");

  useEffect(() => {
    if (isDone || isFailed) {
      onDone();
    }
  }, [isDone, isFailed]);

  return (
    <>
      {eventMessages.length > 0 && (
        <div className="mt-8 w-full max-w-lg mx-auto rounded-xl border border-neutral-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border-b border-neutral-800">
            <span
              className={`w-2 h-2 rounded-full ${toneDotColor[latestTone] ?? "bg-neutral-500"}`}
            />
            <span className="text-xs text-neutral-500 font-mono flex-1">
              indexing output
            </span>
            <span className="text-[10px] uppercase tracking-wide text-neutral-400">
              {statusLabel.replaceAll("_", " ")}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-neutral-500">
              {connectionStatus}/{runStatus}
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto bg-black/40 p-4 font-mono text-left space-y-2 custom-scrollbar scrollbar-thin scrollbar-thumb-neutral-700/80 hover:scrollbar-thumb-neutral-500 scrollbar-track-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-neutral-500">
                {eventMessages.length} event message
                {eventMessages.length > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={() => setShowAllEvents((v) => !v)}
                className="text-[11px] text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                {showAllEvents ? "Show latest 8" : "Show all"}
              </button>
            </div>
            {visibleEventMessages.map((m, i) => (
              <div
                key={`${m.message}-${i}`}
                className="flex items-start gap-2 text-xs leading-5 border-b border-neutral-900 pb-2"
              >
                <span className="shrink-0 mt-1 text-neutral-600">›</span>
                <div className="flex-1">
                  <div className="text-neutral-300">{m.message}</div>
                  <div className="mt-1 text-[10px] text-neutral-500">
                    {m.stage
                      ? m.stage.replaceAll("_", " ")
                      : (m.status ?? "event")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(isDone || isFailed) && (
        <div
          className={`mt-4 w-full max-w-lg mx-auto rounded-xl border px-4 py-3 text-sm text-left ${
            isDone
              ? "bg-green-950 border-green-800 text-green-300"
              : "bg-red-950 border-red-800 text-red-300"
          }`}
        >
          {isDone ? "✓ Repository indexed successfully!" : "✗ Indexing failed."}
        </div>
      )}
    </>
  );
}
