// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/app/ingest/ingest_client";
import { indexRepo } from "@/app/ingest/indexRepo";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [indexRepo],
});
