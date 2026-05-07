// lib/client/inngest.ts
import { eventType, Inngest } from "inngest";
import { z } from "zod";

export const inngest = new Inngest({
  id: "codebaseQA",
  ...(process.env.INNGEST_EVENT_KEY
    ? { eventKey: process.env.INNGEST_EVENT_KEY }
    : {}),
  ...(process.env.INNGEST_SIGNING_KEY
    ? { signingKey: process.env.INNGEST_SIGNING_KEY }
    : {}),
});
export const indexCreated = eventType("app/index-repo", {
  schema: z.object({
    github_repo_url: z.string(),
    runId: z.string(),
    projectId: z.string(), // ← add this
  }),
});
