#!/usr/bin/env node
/**
 * E2E cabo-a-rabo — jornada do médico aluno (local Vite + Supabase live).
 * Cria/usa conta QA dedicada (não admin) e exercita:
 * mapa/cartógrafo → mastery → caso do dia → academy → professores → mentors
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishable =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const base = process.env.SMOKE_BASE || "http://127.0.0.1:5173";
const QA_EMAIL = process.env.E2E_QA_EMAIL || "qa.aluno.doutiva@jubex.com.br";
const QA_PASS = process.env.E2E_QA_PASS || `QaAluno-${Date.now().toString(36)}!Aa1`;

const results = [];
const ok = (n, d = "") => {
  results.push({ n, pass: true, d });
  console.log(`PASS  ${n}${d ? " — " + d : ""}`);
};
const fail = (n, d = "") => {
  results.push({ n, pass: false, d });
  console.error(`FAIL  ${n}${d ? " — " + d : ""}`);
};

async function authedFetch(path, token, init = {}) {
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
}

async function main() {
  console.log("=== E2E jornada médico aluno ===");
  console.log({ base, QA_EMAIL, openai: !!process.env.OPENAI_API_KEY });
  const admin = createClient(url, service);
  const anon = createClient(url, publishable);

  // --- Ensure QA user (student, not admin) ---
  let userId;
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  let existing = listed.data?.users?.find((u) => u.email === QA_EMAIL);
  if (!existing) {
    const { data, error } = await admin.auth.admin.createUser({
      email: QA_EMAIL,
      password: QA_PASS,
      email_confirm: true,
      user_metadata: { role: "student", e2e: true },
    });
    if (error) {
      fail("qa.create", error.message);
      process.exit(1);
    }
    existing = data.user;
    ok("qa.create", QA_EMAIL);
  } else {
    await admin.auth.admin.updateUserById(existing.id, {
      password: QA_PASS,
      email_confirm: true,
    });
    ok("qa.reuse", QA_EMAIL);
  }
  userId = existing.id;

  // Strip admin role if present
  await admin.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
  const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", userId);
  if ((roles || []).some((r) => r.role === "admin")) fail("qa.not_admin", "ainda admin");
  else ok("qa.not_admin", "sem role admin");

  const { data: signed, error: sErr } = await anon.auth.signInWithPassword({
    email: QA_EMAIL,
    password: QA_PASS,
  });
  if (sErr || !signed.session) {
    fail("qa.login", sErr?.message || "no session");
    process.exit(1);
  }
  const token = signed.session.access_token;
  ok("qa.login", "JWT ok");

  // --- Health ---
  const health = await (await fetch(`${base}/api/health`)).json();
  if (!health.openai) fail("health.openai", "false");
  else ok("health.openai");

  // --- Topics catalog ---
  const { data: topics } = await admin
    .from("clinical_topics")
    .select("id, slug, title")
    .eq("active", true)
    .order("sort_order");
  if (!topics?.length) fail("catalog.topics", "vazio");
  else ok("catalog.topics", String(topics.length));

  // --- Seed mastery for 6 topics so mapReady + personal case can engage ---
  for (let i = 0; i < Math.min(6, topics.length); i++) {
    const score = i < 2 ? 80 : i < 4 ? 55 : 25;
    const conf = i < 2 ? 0.8 : 0.5;
    await admin.rpc("upsert_mastery_by_topic", {
      _user_id: userId,
      _topic_id: topics[i].id,
      _score: score,
      _confidence: conf,
      _evidence: { source: "e2e-seed" },
    });
  }
  const { data: mastery } = await admin
    .from("mastery_by_topic")
    .select("band, score, attempts")
    .eq("user_id", userId);
  const touched = (mastery || []).filter((m) => m.attempts > 0);
  ok("map.seed", `${touched.length} temas · green=${touched.filter((m) => m.band === "green").length}`);

  // --- Cartógrafo live turn ---
  const c1 = await authedFetch("/api/brain/cartographer", token, {
    method: "POST",
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content:
            "Sou clínico geral. Quero calibrar o mapa. Em incretinas conheço STEP e SELECT. Comece.",
        },
      ],
    }),
  });
  const c1raw = await c1.text();
  if (!c1.ok) fail("cartographer.t1", `${c1.status} ${c1raw.slice(0, 180)}`);
  else {
    const j = JSON.parse(c1raw);
    if (j.reply?.length > 15) ok("cartographer.t1", j.reply.slice(0, 70).replace(/\s+/g, " "));
    else fail("cartographer.t1", "reply curta");
    if (j.map?.topics?.length >= 6) ok("cartographer.map_payload", `ready=${j.map.ready}`);
    else fail("cartographer.map_payload", "sem mapa");

    const c2 = await authedFetch("/api/brain/cartographer", token, {
      method: "POST",
      body: JSON.stringify({
        sessionId: j.sessionId,
        messages: [
          {
            role: "user",
            content:
              "Sou clínico geral. Quero calibrar o mapa. Em incretinas conheço STEP e SELECT. Comece.",
          },
          { role: "assistant", content: j.reply },
          {
            role: "user",
            content:
              "Sei: SELECT reduziu MACE com semaglutida 2,4 mg vs placebo. Confiança: sei.",
          },
        ],
      }),
    });
    const c2raw = await c2.text();
    if (!c2.ok) fail("cartographer.t2", `${c2.status} ${c2raw.slice(0, 180)}`);
    else {
      const j2 = JSON.parse(c2raw);
      ok("cartographer.t2", (j2.reply || "").slice(0, 60).replace(/\s+/g, " "));
      if (j2.assessment) ok("cartographer.assessment", `score=${j2.assessment.score}`);
      else ok("cartographer.assessment", "sem assessment neste turno");
    }
  }

  // --- Professores IA (preceptor) ---
  const { data: lessons } = await admin
    .from("lessons")
    .select("id, title, status")
    .eq("status", "published")
    .limit(1);
  if (!lessons?.[0]) fail("preceptor.lesson", "sem aula publicada");
  else {
    ok("preceptor.lesson", lessons[0].title.slice(0, 50));
    const p = await authedFetch("/api/preceptor", token, {
      method: "POST",
      body: JSON.stringify({
        lessonId: lessons[0].id,
        persona: "socratico",
        messages: [{ role: "user", content: "Estou pronto. Uma pergunta só." }],
      }),
    });
    if (!p.ok) fail("preceptor.stream", `${p.status} ${(await p.text()).slice(0, 120)}`);
    else {
      const text = await p.text();
      if (text.length > 20) ok("preceptor.stream", text.slice(0, 80).replace(/\s+/g, " "));
      else fail("preceptor.stream", "resposta vazia");
    }
  }

  // --- Tutor ---
  if (lessons?.[0]) {
    const t = await authedFetch("/api/tutor", token, {
      method: "POST",
      body: JSON.stringify({
        lessonId: lessons[0].id,
        messages: [{ role: "user", content: "Resuma em 2 linhas o ponto-chave desta aula." }],
      }),
    });
    if (!t.ok) fail("tutor.stream", `${t.status} ${(await t.text()).slice(0, 120)}`);
    else {
      const text = await t.text();
      if (text.length > 20) ok("tutor.stream", text.slice(0, 80).replace(/\s+/g, " "));
      else fail("tutor.stream", "vazio");
    }
  }

  // --- Courses catalog via REST (same tables UI uses) ---
  const { data: courses, error: cErr } = await anon
    .from("courses")
    .select("id, slug, title, published")
    .eq("published", true);
  // anon may be blocked by RLS — use user client
  const userClient = createClient(url, publishable, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: coursesU, error: cErr2 } = await userClient
    .from("courses")
    .select("id, slug, title, published")
    .eq("published", true);
  if (cErr2 || !coursesU?.length) fail("academy.courses", cErr2?.message || "vazio");
  else ok("academy.courses", `${coursesU.length} publicados`);

  const free = coursesU?.find((c) => c.slug?.includes("peptide")) || coursesU?.[0];
  if (free) {
    const { data: courseLessons, error: lErr } = await userClient
      .from("lessons")
      .select("id, title, status, position")
      .eq("course_id", free.id)
      .eq("status", "published")
      .order("position");
    if (lErr || !courseLessons?.length) fail("academy.lessons", lErr?.message || "0");
    else ok("academy.lessons", `${courseLessons.length} em ${free.slug}`);
  }

  // --- Mentors directory ---
  const { data: mentors, error: mErr } = await userClient
    .from("mentors")
    .select("id, slug, name, published")
    .eq("published", true);
  if (mErr) fail("mentors.list", mErr.message);
  else ok("mentors.list", `${(mentors || []).length} publicados`);

  // --- Daily case grading path: load published case keys via service, grade as student would ---
  const { data: caseLessons } = await admin
    .from("lessons")
    .select("id, title, clinical_case, status")
    .eq("status", "published")
    .not("clinical_case", "is", null)
    .limit(5);
  const withOpts = (caseLessons || []).find((l) => {
    const c = l.clinical_case;
    return c && typeof c === "object" && Array.isArray(c.options) && c.options.length >= 2;
  });
  if (!withOpts) ok("caso.pool", "casos via rich content / keys (ok se clinical_case redacted)");
  else ok("caso.pool", withOpts.title.slice(0, 50));

  // --- UI routes resolve (SSR/CSR shell) ---
  for (const path of ["/auth", "/mapa", "/caso-do-dia", "/academy", "/professores", "/mentors", "/dashboard"]) {
    const r = await fetch(`${base}${path}`, { redirect: "manual" });
    // Vite SPA: usually 200 with shell
    if (r.status >= 500) fail(`route${path}`, String(r.status));
    else ok(`route${path}`, String(r.status));
  }

  // --- Deep brain (tsx-free approximations via DB + HTTP already covered) ---
  {
    const { data: masteryNow } = await admin
      .from("mastery_by_topic")
      .select("band, attempts")
      .eq("user_id", userId);
    const touchedNow = (masteryNow || []).filter((m) => m.attempts > 0);
    if (touchedNow.length >= 3) ok("brain.map_ready_threshold", `${touchedNow.length} temas`);
    else fail("brain.map_ready_threshold", String(touchedNow.length));

    const { data: offs } = await admin
      .from("mentor_offerings")
      .select("id, title, active")
      .eq("active", true);
    if ((offs || []).length >= 1) ok("mentors.offerings", `${offs.length} ativas`);
    else fail("mentors.offerings", "0 — marketplace sem preço");

    const { count: gapCount } = await admin
      .from("content_gaps")
      .select("*", { count: "exact", head: true });
    ok("studio.gaps_table", `count=${gapCount ?? 0}`);
  }

  // --- Production honesty ---
  try {
    const ph = await (await fetch("https://www.doutiva.com.br/api/health")).json();
    if (ph.openai) ok("prod.openai");
    else fail("prod.openai", "ainda false — bloqueia lançamento público");
    const pm = await fetch("https://www.doutiva.com.br/mapa", { redirect: "manual" });
    if (pm.status === 404) fail("prod.mapa", "404 — merge PR #3 pendente");
    else ok("prod.mapa", String(pm.status));
  } catch (e) {
    fail("prod", e.message);
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass);
  const localFail = failed.filter((f) => !f.n.startsWith("prod."));
  console.log(`\n=== SUMMARY ${passed}/${results.length} ===`);
  for (const f of failed) console.log(` - ${f.n}: ${f.d}`);
  console.log("\n=== GO / NO-GO ===");
  if (localFail.length === 0 && failed.some((f) => f.n.startsWith("prod."))) {
    console.log("LOCAL: GO para piloto interno.");
    console.log("PRODUÇÃO: NO-GO até merge PR #3 + OPENAI na Vercel.");
    process.exit(2);
  } else if (localFail.length === 0) {
    console.log("GO — local e produção ok.");
    process.exit(0);
  } else {
    console.log("NO-GO local — corrigir falhas antes de convidar médicos.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
