// lib/client/inngest.ts
import { eventType, Inngest } from "inngest";
import { z } from "zod";

export const inngest = new Inngest({ id: "codebaseQA" });
export const indexCreated = eventType("app/index-repo", {
  schema: z.object({
    github_repo_url: z.string(),
    runId: z.string(),
    projectId: z.string(), // ← add this
  }),
});
