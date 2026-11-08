/**
 * Server-side Supabase URL + publishable key resolution.
 * Falls back to the public browser config when Vercel env vars are missing,
 * so authenticated server functions keep working in production.
 * Never falls back for the service role key.
 */
import {
  PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  PUBLIC_SUPABASE_URL,
} from "@/integrations/supabase/public-config";

export function getSupabaseServerUrl(): string {
  const url =
    process.env["SUPABASE_URL"] ||
    process.env["VITE_SUPABASE_URL"] ||
    PUBLIC_SUPABASE_URL;
  return url.replace(/\/+$/, "");
}

export function getSupabasePublishableKey(): string {
  return (
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function hasSupabasePublishableConfig(): boolean {
  return Boolean(getSupabaseServerUrl() && getSupabasePublishableKey());
}
