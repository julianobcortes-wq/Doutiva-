#!/usr/bin/env node
/** Upsert gold source packs + optional embeddings. */
import { readFileSync } from "node:fs";
import { allGoldRows } from "./gold-sources-v3.mjs";

function loadEnv() {
  try {
    for (const line of readFileSync(".env", "utf8").split("\n")) {
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i < 0) continue;
      const k = line.slice(0, i);
      const v = line.slice(i + 1);
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* optional */
  }
}
loadEnv();

const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const aiBase = (process.env.AI_GATEWAY_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const aiKey = process.env.OPENAI_API_KEY;
const model = process.env.DOUTIVA_EMBED_MODEL || "text-embedding-3-small";
if (!base || !key) throw new Error("SUPABASE_URL / SERVICE_ROLE required");

const hdr = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

async function upsert(row) {
  // Try update by external_id first
  const found = await fetch(
    `${base}/rest/v1/knowledge_sources?external_id=eq.${encodeURIComponent(row.external_id)}&select=id`,
    { headers: hdr },
  ).then((r) => r.json());
  if (Array.isArray(found) && found[0]?.id) {
    const u = await fetch(`${base}/rest/v1/knowledge_sources?id=eq.${found[0].id}`, {
      method: "PATCH",
      headers: { ...hdr, Prefer: "return=minimal" },
      body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }),
    });
    return u.ok;
  }
  const res = await fetch(`${base}/rest/v1/knowledge_sources`, {
    method: "POST",
    headers: { ...hdr, Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (res.ok || res.status === 201) return true;
  const t = await res.text();
  if (/duplicate|23505/i.test(t)) return true;
  console.error("fail", row.external_id, t.slice(0, 180));
  return false;
}

async function embedGold() {
  if (!aiKey) return 0;
  const list = await fetch(
    `${base}/rest/v1/knowledge_sources?select=id,title,abstract,full_text,tags&notes=like.*raise-bar*&embedding=is.null&limit=80`,
    { headers: hdr },
  ).then((r) => r.json());
  let done = 0;
  for (let i = 0; i < list.length; i += 8) {
    const chunk = list.slice(i, i + 8);
    const texts = chunk.map((s) =>
      [s.title, (s.tags || []).join(", "), s.abstract || "", (s.full_text || "").slice(0, 6000)]
        .join("\n")
        .slice(0, 8000),
    );
    const res = await fetch(`${aiBase}/embeddings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, input: texts }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(j).slice(0, 200));
    for (const d of j.data) {
      const id = chunk[d.index].id;
      const u = await fetch(`${base}/rest/v1/knowledge_sources?id=eq.${id}`, {
        method: "PATCH",
        headers: { ...hdr, Prefer: "return=minimal" },
        body: JSON.stringify({ embedding: JSON.stringify(d.embedding) }),
      });
      if (u.ok) done++;
    }
  }
  return done;
}

const rows = allGoldRows();
let ok = 0;
for (const row of rows) if (await upsert(row)) ok++;
const embedded = await embedGold();
console.log(JSON.stringify({ gold_rows: rows.length, upsert_ok: ok, embedded }, null, 2));
