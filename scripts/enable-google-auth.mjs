#!/usr/bin/env node
/**
 * Enable Google OAuth on the Doutiva Supabase project.
 * Requires: SUPABASE_ACCESS_TOKEN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * Optional: SUPABASE_PROJECT_ID (default ynmlbkfdjxzmsndcquap)
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.bootstrap"));

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID || "ynmlbkfdjxzmsndcquap";
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}
if (!clientId || !clientSecret) {
  console.error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET");
  process.exit(1);
}

const siteUrl = "https://www.doutiva.com.br";
const allow = [
  "http://127.0.0.1:5173/**",
  "http://localhost:5173/**",
  "https://*.trycloudflare.com/**",
  "https://www.doutiva.com.br/**",
  "https://doutiva.com.br/**",
  "https://*.vercel.app/**",
].join(",");

const body = {
  site_url: siteUrl,
  uri_allow_list: allow,
  external_google_enabled: true,
  external_google_client_id: clientId,
  external_google_secret: clientSecret,
};

const res = await fetch(`https://api.supabase.com/v1/projects/${projectId}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const text = await res.text();
if (!res.ok) {
  console.error("Failed", res.status, text.slice(0, 500));
  process.exit(1);
}

const cfg = JSON.parse(text);
console.log(
  JSON.stringify(
    {
      ok: true,
      projectId,
      site_url: cfg.site_url,
      external_google_enabled: cfg.external_google_enabled,
      has_client_id: Boolean(cfg.external_google_client_id),
      callback: `https://${projectId}.supabase.co/auth/v1/callback`,
    },
    null,
    2,
  ),
);
