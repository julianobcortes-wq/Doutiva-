#!/usr/bin/env node
/**
 * Garante 1 oferta ativa por mentor publicado (piloto marketplace).
 * Idempotente — não duplica se já existir oferta ativa.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}

const sb = createClient(url, service);
const { data: mentors, error } = await sb
  .from("mentors")
  .select("id, slug, name")
  .eq("published", true);
if (error) throw error;

let created = 0;
for (const m of mentors || []) {
  const { data: existing } = await sb
    .from("mentor_offerings")
    .select("id")
    .eq("mentor_id", m.id)
    .eq("active", true)
    .limit(1);
  if (existing?.length) {
    console.log("skip", m.slug);
    continue;
  }
  const { error: iErr } = await sb.from("mentor_offerings").insert({
    mentor_id: m.id,
    kind: "session",
    title: `Sessão clínica com ${m.name}`,
    description:
      "Mentoria 1:1 — revisão de caso e plano terapêutico (piloto Doutiva). Take rate padrão 20%.",
    price_cents: 45000,
    currency: "BRL",
    duration_minutes: 45,
    take_rate_bps: 2000,
    active: true,
  });
  if (iErr) throw iErr;
  created += 1;
  console.log("created", m.slug);
}
console.log(`done · created=${created} · mentors=${(mentors || []).length}`);
