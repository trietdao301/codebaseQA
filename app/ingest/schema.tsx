import { realtime } from "inngest";
import { z } from "zod";

export const schema = realtime.channel({
  name: ({ runId }: { runId: string }) => `pipeline:${runId}`,
  topics: {
    events: {
      schema: z.object({
        message: z.string(),
        tone: z.enum(["info", "success", "error", "warning"]),
        status: z.enum([
          "cloning",
          "parsing",
          "chunking",
          "indexing",
          "cleanup",
          "done",
          "failed",
        ]),
        stage: z
          .enum([
            "cloning",
            "parsing",
            "chunking",
            "chunking_done",
            "lexical_indexing",
            "lexical_indexing_done",
            "semantic_indexing",
            "semantic_indexing_done",
            "cleanup",
            "cleanup_done",
          ])
          .optional(),
        count: z.number().optional(),
        total: z.number().optional(),
        file: z.string().optional(),
      }),
    },
  },
});
