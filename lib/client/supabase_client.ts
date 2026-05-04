
import { createBrowserClient } from "@supabase/ssr";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Call on client side
export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );