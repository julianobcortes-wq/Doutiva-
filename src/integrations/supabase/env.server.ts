/**
 * Server-side Supabase URL + publishable key resolution.
 * Falls back to the public browser config when Vercel env vars are missing,
 * so authenticated server functions keep working in production.
 * Never falls back for the service role key.
 *
 * Also ignores a known-dead independent project ref still present in some
 * Vercel envs (DNS NXDOMAIN) so Auth cannot silently break after login.
 */
import {
  PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  PUBLIC_SUPABASE_URL,
} from "@/integrations/supabase/public-config";

const DEAD_SUPABASE_HOST = "ynmlbkfdjxzmsndcquap.supabase.co";

function isDeadSupabaseUrl(url: string): boolean {
  try {
    return new URL(url).hostname === DEAD_SUPABASE_HOST;
  } catch {
    return url.includes(DEAD_SUPABASE_HOST);
  }
}

export function getSupabaseServerUrl(): string {
  const fromEnv = (
    process.env["SUPABASE_URL"] ||
    process.env["VITE_SUPABASE_URL"] ||
    ""
  ).replace(/\/+$/, "");
  if (fromEnv && !isDeadSupabaseUrl(fromEnv)) return fromEnv;
  return PUBLIC_SUPABASE_URL.replace(/\/+$/, "");
}

export function getSupabasePublishableKey(): string {
  const url = getSupabaseServerUrl();
  // If we fell back to public URL because env pointed at a dead host,
  // also use the matching public key (env key would be for the dead project).
  if (url === PUBLIC_SUPABASE_URL.replace(/\/+$/, "")) {
    return PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  }
  return (
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function hasSupabasePublishableConfig(): boolean {
  return Boolean(getSupabaseServerUrl() && getSupabasePublishableKey());
}
