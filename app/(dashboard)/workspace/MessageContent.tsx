// "use client";

// import type { ReactNode } from "react";

// function renderInline(text: string) {
//   const segments = text.split(/(`[^`]+`)/g);
//   return segments.map((segment, index) => {
//     if (segment.startsWith("`") && segment.endsWith("`")) {
//       return (
//         <code
//           key={`inline-code-${index}`}
//           className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-[11px] text-zinc-100"
//         >
//           {segment.slice(1, -1)}
//         </code>
//       );
//     }
//     return <span key={`inline-text-${index}`}>{segment}</span>;
//   });
// }

// export function renderMessageContent(content: string, role: "user" | "assistant") {
//   if (role === "user") {
//     return <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>;
//   }

//   const blocks = content.split(/```/g);
//   const rendered: ReactNode[] = [];

//   for (let i = 0; i < blocks.length; i++) {
//     const block = blocks[i];
//     const isCodeBlock = i % 2 === 1;

//     if (isCodeBlock) {
//       const lines = block.split("\n");
//       const maybeLanguage = lines[0]?.trim();
//       const code = lines.slice(1).join("\n").trimEnd();
//       rendered.push(
//         <pre
//           key={`code-${i}`}
//           className="my-3 overflow-x-auto rounded-xl border border-zinc-700/80 bg-zinc-950 p-0 text-xs shadow-inner shadow-black/30"
//         >
//           {maybeLanguage ? (
//             <div className="border-b border-zinc-700/80 bg-zinc-900/70 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
//               {maybeLanguage}
//             </div>
//           ) : null}
//           <div className="p-3">
//           <code className="font-mono text-zinc-100">{code}</code>
//           </div>
//         </pre>
//       );
//       continue;
//     }

//     const lines = block.split("\n");
//     const paragraphLines: string[] = [];

//     const flushParagraph = () => {
//       const text = paragraphLines.join(" ").trim();
//       if (!text) return;
//       rendered.push(
//         <p key={`p-${i}-${rendered.length}`} className="mb-2 text-sm leading-7 text-zinc-200">
//           {renderInline(text)}
//         </p>
//       );
//       paragraphLines.length = 0;
//     };

//     for (const rawLine of lines) {
//       const line = rawLine.trim();
//       if (!line) {
//         flushParagraph();
//         continue;
//       }

//       if (line.startsWith("### ")) {
//         flushParagraph();
//         rendered.push(
//           <h4 key={`h3-${i}-${rendered.length}`} className="mb-2 mt-1 text-sm font-semibold text-zinc-100">
//             {line.slice(4)}
//           </h4>
//         );
//         continue;
//       }

//       if (line.startsWith("## ")) {
//         flushParagraph();
//         rendered.push(
//           <h3 key={`h2-${i}-${rendered.length}`} className="mb-2 mt-1 text-sm font-semibold text-zinc-100">
//             {line.slice(3)}
//           </h3>
//         );
//         continue;
//       }

//       if (/^\d+\.\s/.test(line)) {
//         flushParagraph();
//         rendered.push(
//           <div key={`oli-${i}-${rendered.length}`} className="mb-1.5 flex gap-2 text-sm leading-relaxed text-zinc-200">
//             <span className="w-5 shrink-0 text-right font-medium text-zinc-400">{line.split(".")[0]}.</span>
//             <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
//           </div>
//         );
//         continue;
//       }

//       if (line.startsWith("- ")) {
//         flushParagraph();
//         rendered.push(
//           <div key={`li-${i}-${rendered.length}`} className="mb-1.5 flex gap-2 text-sm leading-relaxed text-zinc-200">
//             <span className="pt-1 text-zinc-500">•</span>
//             <span>{renderInline(line.slice(2))}</span>
//           </div>
//         );
//         continue;
//       }

//       if (line.startsWith("> ")) {
//         flushParagraph();
//         rendered.push(
//           <blockquote
//             key={`quote-${i}-${rendered.length}`}
//             className="mb-2 rounded-r-lg border-l-2 border-cyan-400/50 bg-cyan-500/5 px-3 py-2 text-sm italic leading-relaxed text-zinc-300"
//           >
//             {renderInline(line.slice(2))}
//           </blockquote>
//         );
//         continue;
//       }

//       paragraphLines.push(line);
//     }
//     flushParagraph();
//   }

//   return <div className="text-sm">{rendered}</div>;
// }
