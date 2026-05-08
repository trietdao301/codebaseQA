// app/api/realtime-token/route.ts
import { inngest } from "@/app/ingest/ingest_client";
import { schema } from "@/app/ingest/schema";
import { getClientSubscriptionToken } from "inngest/react";

function getRequestOrigin(req: Request) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProto = req.headers.get("x-forwarded-proto") ?? "http";
    return `${forwardedProto}://${forwardedHost}`;
  }

  const url = new URL(req.url);
  const host = req.headers.get("host");
  return host ? `${url.protocol}//${host}` : url.origin;
}

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

  const browserBaseUrl = process.env.INNGEST_BROWSER_BASE_URL
    ? new URL(process.env.INNGEST_BROWSER_BASE_URL, getRequestOrigin(req))
        .toString()
        .replace(/\/$/, "")
    : undefined;

  return Response.json(
    browserBaseUrl ? { ...token, apiBaseUrl: browserBaseUrl } : token,
  );
}
