"use client";
import Projects from "./Projects";
import Features from "./HowItWorks";

import { FaGithub } from "react-icons/fa";
import { useState } from "react";
import { useIndexRepo } from "../hooks/useIndexRepo";

export default function Content() {
  const [repoUrl, setRepoUrl] = useState("");
  const { indexRepo, isSubmitting, result, logs } = useIndexRepo();

  function handleIndexRepository() {
    indexRepo(repoUrl);
  }

  return (
    <section className="flex flex-col px-10 items-center justify-center py-10  mx-40">

      <div className="mt-10 text-center bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,#2a2a2a_0%,#111111_60%,#0a0a0a_100%)] pt-50 pr-90 pl-90 pb-50 border-[0.5px] border-[var(--color-border-tertiary)] rounded-2xl w-full ">
        <h1 className="text-4xl md:text-5xl font-medium text-white leading-tight tracking-tight mb-5">
          <span className="text-4xl text-indigo-300">Quick and Easy</span>
          <br />
          Explore any repository with AI
        </h1>

        <p className="text-lg text-neutral-400 mb-10">
          Index a GitHub repository and ask questions about it
        </p>

        {/* Input pill */}
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

        {/* Logs */}
        {logs.length > 0 && (
          <div className="mt-8 w-full max-w-lg mx-auto rounded-xl border border-neutral-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border-b border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-neutral-600" />
              <span className="text-xs text-neutral-500 font-mono">indexing output</span>
            </div>

            {/* Log lines */}
            <div className="max-h-52 overflow-y-auto 
                scrollbar-thin 
                scrollbar-track-black 
                scrollbar-thumb-neutral-700 
                hover:scrollbar-thumb-neutral-500
                bg-black/40 p-4 font-mono text-left space-y-1 custom-scrollbar">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-xs leading-5">
                  <span className={`shrink-0 mt-1 ${
                    log.tone === "success" ? "text-green-500" :
                    log.tone === "error"   ? "text-red-500"   :
                                            "text-neutral-600"
                  }`}>
                    {log.tone === "success" ? "✓" : log.tone === "error" ? "✗" : "›"}
                  </span>
                  <span className={
                    log.tone === "success" ? "text-green-400" :
                    log.tone === "error"   ? "text-red-400"   :
                                            "text-neutral-500"
                  }>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`mt-4 w-full max-w-lg mx-auto rounded-xl border px-4 py-3 text-sm text-left ${
            result.success
              ? "bg-green-950 border-green-800 text-green-300"
              : "bg-red-950 border-red-800 text-red-300"
          }`}>
            {result.success ? (
              <div className="flex flex-col gap-1">
                <p className="font-medium">✓ {result.message}</p>
                {result.repoUrl && <p className="text-xs text-green-500">Repo: {result.repoUrl}</p>}
                {result.localPath && <p className="text-xs text-green-500">Path: {result.localPath}</p>}
              </div>
            ) : (
              <p>✗ {result.error}</p>
            )}
          </div>
        )}

      </div>

    </section>
  );
}