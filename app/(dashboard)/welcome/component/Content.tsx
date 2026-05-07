// Content.tsx
"use client";
import { FaGithub } from "react-icons/fa";
import { useEffect, useState } from "react";
import { RealTimeProgress } from "./RealTimeProgress";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const ACTIVE_RUN_ID_KEY = "welcome_active_run_id";

export default function Content() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [repoUrl, setRepoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [runId, setRunId] = useState<string | null>(() => {
    const fromUrl = searchParams.get("runId");
    if (fromUrl) return fromUrl;
    if (typeof window !== "undefined") {
      return localStorage.getItem(ACTIVE_RUN_ID_KEY);
    }
    return null;
  });
  const queryClient = useQueryClient();
  async function handleIndexRepository() {
    if (!repoUrl.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/index-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        setError(payload.error ?? "Failed to start indexing.");
        setIsSubmitting(false);
        return;
      }
      const nextRunId = payload.runId as string;
      setRunId(nextRunId);
      localStorage.setItem(ACTIVE_RUN_ID_KEY, nextRunId);

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set("runId", nextRunId);
      router.replace(`${pathname}?${nextParams.toString()}`);
    } catch {
      setError("Network error.");
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex flex-col px-10 items-center justify-center py-10 mx-40">
      <div className="mt-10 text-center bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,#2a2a2a_0%,#111111_60%,#0a0a0a_100%)] pt-50 pr-90 pl-90 pb-50 border-[0.5px] border-[var(--color-border-tertiary)] rounded-2xl w-full">
        <h1 className="text-4xl md:text-5xl font-medium text-white leading-tight tracking-tight mb-5">
          <span className="text-4xl text-indigo-300">Quick and Easy</span>
          <br />
          Explore any repository with AI
        </h1>

        <p className="text-lg text-neutral-400 mb-10">
          Index a GitHub repository and ask questions about it
        </p>

        <div className="flex items-center w-full max-w-lg mx-auto bg-neutral-900 border border-neutral-700 rounded-full px-4 py-2 gap-2 focus-within:border-indigo-500 transition-colors">
          <FaGithub className="w-4 h-4 text-neutral-500 shrink-0" />
          <input
            type="text"
            placeholder="github.com/owner/repository"
            className="flex-1 bg-transparent text-white text-sm placeholder-neutral-500 outline-none"
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <button
            onClick={handleIndexRepository}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors shrink-0"
          >
            {isSubmitting ? "Indexing..." : "Index"}
          </button>
        </div>

        <p className="text-xs text-neutral-600 mt-3">
          e.g. github.com/vercel/next.js
        </p>

        {error && (
          <div className="mt-4 w-full max-w-lg mx-auto rounded-xl border px-4 py-3 text-sm text-left bg-red-950 border-red-800 text-red-300">
            ✗ {error}
          </div>
        )}

        {/* Only mounts when runId exists — no null token calls */}
        {runId && (
          <RealTimeProgress
            runId={runId}
            onDone={async () => {
              setIsSubmitting(false);
              await queryClient.invalidateQueries({ queryKey: ["projects"] });
            }}
          />
        )}
      </div>
    </section>
  );
}
