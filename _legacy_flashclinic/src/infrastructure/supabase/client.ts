import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

let supabaseInstance: SupabaseClient | null = null;

if (SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)) {
  // Prefer service role key for server-side operations (bypasses RLS)
  // Fall back to anon key for client-side or development
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  supabaseInstance = createClient(SUPABASE_URL, key);
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    throw new Error(
      "Supabase client not initialized. Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) environment variables."
    );
  }
  return supabaseInstance;
}

export const supabase = supabaseInstance;
