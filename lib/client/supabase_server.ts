import dotenv from "dotenv";
dotenv.config(); // loads .env before anything else

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function createSupabaseWithCookieStore(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component refresh path; middleware may handle sessions.
        }
      },
    },
  });
}

/** Call inside a request scope (route handler, server component, etc.), not at module load. */
async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createSupabaseWithCookieStore(cookieStore);
}

// clients.ts
let supabaseInstance: Awaited<
  ReturnType<typeof createSupabaseServerClient>
> | null = null;

export const getSupabaseServerClient = async () => {
  if (!supabaseInstance) {
    supabaseInstance = await createSupabaseServerClient();
  }
  return supabaseInstance;
};
