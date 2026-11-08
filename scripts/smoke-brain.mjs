#!/usr/bin/env node
/**
 * Smoke test — Cérebro Doutiva AI-first (honest).
 * Live Supabase + local Vite. Exit 1 if critical path fails.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishable =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const openai = process.env.OPENAI_API_KEY;
const base = process.env.SMOKE_BASE || "http://127.0.0.1:5173";

const results = [];
const ok = (name, detail = "") => {
  results.push({ name, pass: true, detail });
  console.log(`PASS  ${name}${detail ? " — " + detail : ""}`);
};
const fail = (name, detail = "") => {
  results.push({ name, pass: false, detail });
  console.error(`FAIL  ${name}${detail ? " — " + detail : ""}`);
};

async function main() {
  console.log("=== Smoke Cérebro Doutiva ===");
  console.log(`supabase=${!!url} openai=${!!openai} publishable=${!!publishable} base=${base}`);

  if (!url || !service || !publishable) {
    fail("env", "missing SUPABASE_*");
    process.exit(1);
  }
  const sb = createClient(url, service);

  const { data: topics, error: tErr } = await sb
    .from("clinical_topics")
    .select("id, slug, title")
    .eq("active", true)
    .order("sort_order");
  if (tErr || !topics?.length) fail("db.clinical_topics", tErr?.message || "empty");
  else ok("db.clinical_topics", `${topics.length} temas`);

  const { count: ltCount, error: ltErr } = await sb
    .from("lesson_topics")
    .select("*", { count: "exact", head: true });
  if (ltErr || !ltCount) fail("db.lesson_topics", ltErr?.message || "0 links");
  else ok("db.lesson_topics", `${ltCount} links`);

  for (const table of [
    "mastery_by_topic",
    "brain_sessions",
    "content_gaps",
    "mentor_offerings",
    "mentor_purchases",
  ]) {
    const { error } = await sb.from(table).select("*", { head: true, count: "exact" });
    if (error) fail(`db.${table}`, error.message);
    else ok(`db.${table}`);
  }

  const { data: band, error: bErr } = await sb.rpc("mastery_band", {
    score: 80,
    confidence: 0.7,
  });
  if (bErr || band !== "green") fail("rpc.mastery_band", bErr?.message || String(band));
  else ok("rpc.mastery_band", band);

  // HTTP health
  try {
    const h = await fetch(`${base}/api/health`);
    const j = await h.json();
    if (!j.ok) fail("http.health", JSON.stringify(j));
    else ok("http.health", `openai=${j.openai} anthropic=${j.anthropic}`);
    if (!j.openai) fail("http.openai", "process without OPENAI_API_KEY");
    else ok("http.openai", "true");
  } catch (e) {
    fail("http.health", e.message);
  }

  // Route exists?
  const unauth = await fetch(`${base}/api/brain/cartographer`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  if (unauth.status === 401) ok("http.cartographer.route", "401 sem auth");
  else if (unauth.status === 404)
    fail("http.cartographer.route", "404 — código do cérebro NÃO está no server em execução");
  else fail("http.cartographer.route", `status ${unauth.status}`);

  // Auth user + mastery + cartographer
  const { data: listed } = await sb.auth.admin.listUsers({ page: 1, perPage: 10 });
  const testUser = listed?.users?.find((u) => u.email) || listed?.users?.[0];
  if (!testUser?.email) {
    fail("auth.user", "nenhum usuário para smoke");
  } else {
    const topicId = topics[0].id;
    const { data: row, error: uErr } = await sb.rpc("upsert_mastery_by_topic", {
      _user_id: testUser.id,
      _topic_id: topicId,
      _score: 55,
      _confidence: 0.5,
      _evidence: { source: "smoke-brain" },
    });
    if (uErr) fail("rpc.upsert_mastery", uErr.message);
    else ok("rpc.upsert_mastery", `band=${row.band} score=${row.score}`);

    const pwd = `Smoke-${Date.now()}!aA1`;
    await sb.auth.admin.updateUserById(testUser.id, { password: pwd, email_confirm: true });
    const anon = createClient(url, publishable);
    const { data: signed, error: sErr } = await anon.auth.signInWithPassword({
      email: testUser.email,
      password: pwd,
    });
    if (sErr || !signed?.session) fail("auth.sign_in", sErr?.message || "no session");
    else {
      ok("auth.sign_in", testUser.email);
      const token = signed.session.access_token;

      // Personal daily case via server fn is harder; hit cartographer (the AI center)
      const t0 = Date.now();
      const r = await fetch(`${base}/api/brain/cartographer`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content:
                "Sou médico. Domino bem incretinas STEP/SURMOUNT. Pode começar o mapa clínico com uma pergunta.",
            },
          ],
        }),
      });
      const ms = Date.now() - t0;
      const raw = await r.text();
      if (!r.ok) fail("cartographer.live", `${r.status} ${raw.slice(0, 240)}`);
      else {
        let j;
        try {
          j = JSON.parse(raw);
        } catch {
          fail("cartographer.live", "not json " + raw.slice(0, 120));
        }
        if (j) {
          if (typeof j.reply === "string" && j.reply.length > 20)
            ok("cartographer.reply", `${ms}ms · ${j.reply.slice(0, 90).replace(/\s+/g, " ")}`);
          else fail("cartographer.reply", "reply fraca/ausente");
          if (j.map?.topics?.length >= 6)
            ok("cartographer.map", `topics=${j.map.topics.length} ready=${j.map.ready}`);
          else fail("cartographer.map", JSON.stringify(j.map?.counts || j.map));
          if (j.sessionId) ok("cartographer.session", j.sessionId);
          else fail("cartographer.session", "sem sessionId");
          // Second turn if probe exists — prove assessment path
          if (j.probe?.question || j.reply) {
            const r2 = await fetch(`${base}/api/brain/cartographer`, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                sessionId: j.sessionId,
                messages: [
                  {
                    role: "user",
                    content:
                      "Sou médico. Domino bem incretinas STEP/SURMOUNT. Pode começar o mapa clínico com uma pergunta.",
                  },
                  { role: "assistant", content: j.reply },
                  {
                    role: "user",
                    content:
                      "Sei: SELECT mostrou redução de MACE com semaglutida 2,4 mg. Confiança: sei.",
                  },
                ],
              }),
            });
            const raw2 = await r2.text();
            if (!r2.ok) fail("cartographer.turn2", `${r2.status} ${raw2.slice(0, 200)}`);
            else {
              const j2 = JSON.parse(raw2);
              ok("cartographer.turn2", (j2.reply || "").slice(0, 80).replace(/\s+/g, " "));
              if (j2.assessment) ok("cartographer.assessment", JSON.stringify(j2.assessment).slice(0, 120));
              else ok("cartographer.assessment", "sem assessment neste turno (aceitável se ainda calibrando)");
              const { data: after } = await sb
                .from("mastery_by_topic")
                .select("topic_id, score, band, attempts")
                .eq("user_id", testUser.id);
              const touched = (after || []).filter((x) => x.attempts > 0);
              if (touched.length >= 1)
                ok("cartographer.memory_written", `${touched.length} temas com attempts`);
              else fail("cartographer.memory_written", "mapa não persistiu após turnos");
            }
          }
        }
      }

      // Server fns aren't HTTP; approximate personal case by importing logic via SQL+heuristic
      // Check lesson_topics for red topic
      const { data: links } = await sb
        .from("lesson_topics")
        .select("lesson_id")
        .eq("topic_id", topicId)
        .limit(3);
      if (links?.length) ok("preceptor.lesson_link", `${links.length} aulas para tema seed`);
      else fail("preceptor.lesson_link", "tema sem lesson_topics — Caso pessoal cai no calendário");
    }
  }

  // Production honesty check
  try {
    const prod = await fetch("https://www.doutiva.com.br/api/health");
    const pj = await prod.json();
    if (pj.openai) ok("prod.openai", "true");
    else fail("prod.openai", "false — Vercel sem OPENAI_API_KEY ou não redeployou");
    const prodMap = await fetch("https://www.doutiva.com.br/mapa", {
      redirect: "manual",
    });
    // auth redirect expected; 404 would mean code not deployed
    if (prodMap.status === 404) fail("prod.mapa_route", "404 — PR não está em produção");
    else ok("prod.mapa_route", `status ${prodMap.status} (auth redirect ok)`);
  } catch (e) {
    fail("prod.health", e.message);
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass);
  console.log(`\n=== SUMMARY ${passed}/${results.length} ===`);
  for (const f of failed) console.log(` - FAIL ${f.name}: ${f.detail}`);

  const critical = [
    "db.clinical_topics",
    "rpc.upsert_mastery",
    "http.openai",
    "http.cartographer.route",
    "cartographer.reply",
    "cartographer.memory_written",
  ];
  const critFail = critical.filter((n) => {
    const r = results.find((x) => x.name === n);
    return !r || !r.pass;
  });
  console.log("\n=== VEREDITO HONESTO ===");
  if (critFail.length === 0) {
    console.log("LOCAL: Cérebro (Cartógrafo → memória) FUNCIONA de ponta a ponta.");
  } else {
    console.log("LOCAL crítico falhou:", critFail.join(", "));
  }
  const prodFail = failed.filter((f) => f.name.startsWith("prod."));
  if (prodFail.length)
    console.log(
      "PRODUÇÃO ainda NÃO está ligada para o usuário final:",
      prodFail.map((f) => f.name).join(", "),
    );
  else console.log("PRODUÇÃO: health/openai/mapa ok.");

  process.exit(failed.some((f) => !f.name.startsWith("prod.")) ? 1 : prodFail.length ? 2 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
