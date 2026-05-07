// app/api/realtime-token/route.ts
import { inngest } from "@/app/ingest/ingest_client";
import { schema } from "@/app/ingest/schema";
import { getClientSubscriptionToken } from "inngest/react";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return Response.json({ error: "runId required" }, { status: 400 });
  }

  const ch = schema({ runId });
  const token = await getClientSubscriptionToken(inngest, {
    channel: ch,
    topics: ["events"],
  });
  return Response.json(token);
}
