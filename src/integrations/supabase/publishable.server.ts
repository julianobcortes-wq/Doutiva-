import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/** Server-side client with the publishable key (RLS applies). No service role required. */
export function createPublishableServerClient(accessToken?: string): SupabaseClient<Database> {
  const SUPABASE_URL = process.env["SUPABASE_URL"];
  const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
  }
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

export function hasServiceRole(): boolean {
  return Boolean(process.env["SUPABASE_SERVICE_ROLE_KEY"]);
}
