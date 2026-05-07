import type { ReactNode } from "react";
import type { MessagePartStatus, ToolCallMessagePartStatus } from "@assistant-ui/core";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function parseJsonResult<T>(result: unknown): T | null {
  if (result == null) return null;
  if (typeof result === "object") return result as T;
  if (typeof result === "string") {
    try {
      return JSON.parse(result) as T;
    } catch {
      return null;
    }
  }
  return null;
}

function StatusBadge({
  status,
}: {
  status: MessagePartStatus | ToolCallMessagePartStatus;
}) {
  if (status.type === "running") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200">
        <Loader2 className="h-3 w-3 animate-spin" />
        Running
      </span>
    );
  }
  if (status.type === "complete") {
    return (
      <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-200">
        Done
      </span>
    );
  }
  if (status.type === "requires-action") {
    return (
      <span className="rounded-full border border-sky-500/35 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-200">
        Needs action
      </span>
    );
  }
  const err =
    status.reason === "error" && status.error != null
      ? String(status.error)
      : status.reason;
  return (
    <span
      className="max-w-[180px] truncate rounded-full border border-red-500/35 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-200"
      title={err}
    >
      {status.reason}
    </span>
  );
}

export function ToolCallShell({
  icon,
  title,
  subtitle,
  status,
  accent = "zinc",
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  status: MessagePartStatus | ToolCallMessagePartStatus;
  accent?: "violet" | "sky" | "amber" | "emerald" | "zinc";
  children?: ReactNode;
}) {
  const border =
    accent === "violet"
      ? "border-l-violet-500"
      : accent === "sky"
        ? "border-l-sky-500"
        : accent === "amber"
          ? "border-l-amber-500"
          : accent === "emerald"
            ? "border-l-emerald-500"
            : "border-l-zinc-500";

  return (
    <div
      className={cn(
        "my-2 overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-950/70 text-left shadow-sm",
        "border-l-[3px]",
        border,
      )}
    >
      <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 bg-zinc-900/40 px-3 py-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="mt-0.5 shrink-0 text-zinc-400">{icon}</div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {title}
            </div>
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-zinc-200" title={subtitle}>
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      {children ? (
        <div className="max-h-[min(360px,40vh)] overflow-y-auto px-3 py-2.5 text-xs custom-scrollbar">
          {children}
        </div>
      ) : null}
    </div>
  );
}
