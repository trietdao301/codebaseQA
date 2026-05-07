import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

let serviceSingleton: ReturnType<typeof createClient> | null = null;

/** Supabase for workers (LangGraph, scripts): no Next `cookies()`, uses service role key. */
export function getSupabaseServiceClient(): ReturnType<typeof createClient> {
  if (!serviceSingleton) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      throw new Error(
        "getSupabaseServiceClient: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env for background jobs.",
      );
    }
    serviceSingleton = createClient(url, key);
  }
  return serviceSingleton;
}
