/**
 * Public Supabase browser config (URL + publishable/anon key only).
 * Safe to ship to the client. Never put the service role here.
 * Used as fallback when Vercel build lacks VITE_SUPABASE_* env vars.
 *
 * Live backend is the Lovable-backed project while the independent Doutiva
 * project (`ynmlbkfdjxzmsndcquap`) remains unreachable (DNS NXDOMAIN).
 */
export const PUBLIC_SUPABASE_URL = "https://nflhfjyyaefhxeesvrge.supabase.co";
export const PUBLIC_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_vdb-ThUqi8mx-RuqdDzyig_ylCK2QIr";
export const PUBLIC_SUPABASE_PROJECT_ID = "nflhfjyyaefhxeesvrge";
