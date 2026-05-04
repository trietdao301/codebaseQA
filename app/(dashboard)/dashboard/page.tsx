// "use client";

// import { CheckCircle2, GitBranch, Loader2, XCircle } from "lucide-react";
// import { useState } from "react";
// import { useRouter } from "next/navigation";





// export default function Dashboard() {
//   const router = useRouter();
//   const [repoUrl, setRepoUrl] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [result, setResult] = useState<PipelineResult | null>(null);
//   const [logs, setLogs] = useState<LogEntry[]>([]);

//   function appendLog(entry: Omit<LogEntry, "id">) {
//     setLogs((prev) => [...prev, { ...entry, id: crypto.randomUUID() }]);
//   }

//   async function handleClone(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setResult(null);
//     setLogs([]);

//     try {
//       const response = await fetch("/api/clone", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ repoUrl }),
//       });
//       if (!response.ok || !response.body) {
//         throw new Error("Clone request failed.");
//       }

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();
//       let buffer = "";
//       let completed = false;

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) {
//           break;
//         }

//         buffer += decoder.decode(value, { stream: true });
//         const lines = buffer.split("\n");
//         buffer = lines.pop() ?? "";

//         for (const line of lines) {
//           if (!line.trim()) {
//             continue;
//           }
//           const event = JSON.parse(line) as StreamEvent;
//           const countText =
//             typeof event.count === "number"
//               ? ` (${event.count}${typeof event.total === "number" ? `/${event.total}` : ""})`
//               : "";
//           const fileText = event.file ? ` - ${event.file}` : "";
//           const stageText = event.stage ? ` [${event.stage}]` : "";

//           if (event.type === "clone_completed" || event.type === "index_completed" || event.type === "done") {
//             appendLog({
//               tone: "success",
//               text: `${event.message}${stageText}${countText}${fileText}`,
//             });
//           } else if (event.type === "error") {
//             appendLog({ tone: "error", text: event.message });
//             setResult({
//               success: false,
//               error: event.message,
//               repoUrl: event.repoUrl,
//               localPath: event.localPath,
//             });
//           } else {
//             appendLog({
//               tone: "info",
//               text: `${event.message}${stageText}${countText}${fileText}`,
//             });
//           }

//           if (event.type === "done") {
//             completed = true;
//             const nextResult = {
//               success: true,
//               message: "Repository cloned and indexed successfully.",
//               repoUrl: event.repoUrl,
//               localPath: event.localPath,
//             };
//             setResult(nextResult);
//             if (event.localPath) {
//               const encodedRoot = encodeURIComponent(event.localPath);
//               setTimeout(() => {
//                 router.push(`/workspace?root=${encodedRoot}`);
//               }, 700);
//             }
//           }
//         }
//       }

//       if (!completed) {
//         setResult({
//           success: false,
//           error: "Pipeline ended unexpectedly before completion.",
//         });
//       }
//     } catch (error) {
//       const message = error instanceof Error ? error.message : "Unable to reach the clone API. Try again.";
//       appendLog({ tone: "error", text: message });
//       setResult({
//         success: false,
//         error: message,
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <section className="mx-auto w-full max-w-5xl">
//       <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur xl:p-10">
//         <div className="pointer-events-none absolute -top-24 -right-12 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
//         <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

//         <div className="relative mb-8 flex flex-col items-start justify-between gap-4 md:flex-row">
//           <div className="space-y-3">
//             <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium tracking-wide text-zinc-300">
//               <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
//               Repository Intake
//             </div>
//             <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl xl:text-4xl">
//               Clone GitHub Repositories
//             </h1>
//             <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
//               Enter a GitHub URL to clone the project locally and prepare it for indexing and analysis.
//             </p>
//           </div>
//           <div className="hidden rounded-2xl border border-zinc-700 bg-zinc-800/70 p-3 md:block md:self-start">
//             <GitBranch className="h-6 w-6 text-cyan-300" />
//           </div>
//         </div>

//         <form onSubmit={handleClone} className="relative space-y-4">
//           <div className="space-y-2">
//             <label htmlFor="repo-url" className="text-sm font-medium text-zinc-200">
//               GitHub repository URL
//             </label>
//             <input
//               id="repo-url"
//               type="url"
//               value={repoUrl}
//               onChange={(e) => setRepoUrl(e.target.value)}
//               placeholder="https://github.com/owner/repo"
//               className="w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={isSubmitting || repoUrl.trim().length === 0}
//             className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 Cloning repository...
//               </>
//             ) : (
//               "Clone repository"
//             )}
//           </button>
//         </form>

//         {result && (
//           <div
//             className={`mt-6 rounded-xl border p-4 text-sm ${
//               result.success
//                 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-50"
//                 : "border-rose-500/40 bg-rose-500/10 text-rose-50"
//             }`}
//           >
//             <div className="mb-2 flex items-center gap-2 font-medium">
//               {result.success ? (
//                 <CheckCircle2 className="h-4 w-4 text-emerald-400" />
//               ) : (
//                 <XCircle className="h-4 w-4 text-rose-400" />
//               )}
//               {result.success ? "Clone completed" : "Clone failed"}
//             </div>
//             {result.message && <p className="mb-1">{result.message}</p>}
//             {result.error && <p className="mb-1">{result.error}</p>}
//             {result.localPath && (
//               <p className="mt-2 rounded-lg border border-zinc-700/70 bg-zinc-950/70 px-3 py-2 text-zinc-300">
//                 Local path: <span className="font-mono text-zinc-100">{result.localPath}</span>
//               </p>
//             )}
//           </div>
//         )}

//         <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
//           <div className="mb-3 flex items-center justify-between">
//             <h2 className="text-sm font-semibold tracking-wide text-zinc-200">Pipeline Output</h2>
//             <span className="text-xs text-zinc-500">{logs.length} events</span>
//           </div>
//           <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs">
//             {logs.length === 0 ? (
//               <p className="text-zinc-500">No events yet. Start cloning to view live progress.</p>
//             ) : (
//               logs.map((log) => (
//                 <p
//                   key={log.id}
//                   className={
//                     log.tone === "success"
//                       ? "text-emerald-300"
//                       : log.tone === "error"
//                         ? "text-rose-300"
//                         : "text-zinc-300"
//                   }
//                 >
//                   {log.text}
//                 </p>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }