/**
 * Public Supabase browser config (URL + publishable/anon key only).
 * Safe to ship to the client. Never put the service role here.
 * Used as fallback when Vercel build lacks VITE_SUPABASE_* env vars.
 */
export const PUBLIC_SUPABASE_URL = "https://ynmlbkfdjxzmsndcquap.supabase.co";
export const PUBLIC_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlubWxia2Zkanh6bXNuZGNxdWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MjA0MzMsImV4cCI6MjEwOTM5NjQzM30.bcqSVcjhMnhRgwcdkNxuRF8ys8Q_yKZn21KXEGJe5yQ";
export const PUBLIC_SUPABASE_PROJECT_ID = "ynmlbkfdjxzmsndcquap";
