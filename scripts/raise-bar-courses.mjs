#!/usr/bin/env node
/**
 * Raise-bar: audit→fix (or full regen) using gold corpus + course sources.
 *
 * Usage:
 *   node --env-file=.env --import tsx scripts/raise-bar-courses.mjs --course=tirzepatida-incretinas-consultorio
 *   node --env-file=.env --import tsx scripts/raise-bar-courses.mjs --priority
 *   node --env-file=.env --import tsx scripts/raise-bar-courses.mjs --all
 *   node --env-file=.env --import tsx scripts/raise-bar-courses.mjs --course=... --only=1,2,3
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { COURSES, AUDIENCE } from "./doutiva-curriculum-v3.mjs";
import { packForCourse } from "./gold-sources-v3.mjs";

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

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PRIORITY = [
  "tirzepatida-incretinas-consultorio",
  "hormonios-implantes-criterio",
  "soroterapia-injetaveis-estereis",
];
const SECONDARY = [
  "obesidade-precisao-consultorio",
  "sarcopenia-composicao-performance",
  "ia-pratica-medica",
  "peptideos-medicina-de-precisao",
];

const courseArg = (process.argv.find((a) => a.startsWith("--course=")) || "").split("=")[1];
const onlyArg = (process.argv.find((a) => a.startsWith("--only=")) || "").split("=")[1];
const onlyPos = onlyArg
  ? new Set(onlyArg.split(",").map((x) => Number(x.trim())).filter(Boolean))
  : null;
const modeAll = process.argv.includes("--all");
const modePriority = process.argv.includes("--priority") || (!courseArg && !modeAll);

function sanitize(value) {
  if (typeof value === "string") return value.replace(/\u0000/g, "");
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = sanitize(v);
    return out;
  }
  return value;
}

function redactCase(c) {
  if (!c) return null;
  return sanitize({
    title: c.title,
    vignette: c.vignette,
    data: c.data,
    question: c.question,
    options: (c.options || []).map((o) => ({ label: o.label })),
    reward: Number.isFinite(Number(c.reward)) ? Math.max(1, Math.round(Number(c.reward))) : 40,
  });
}

function keysFromCase(c) {
  const opts = c.options || [];
  const correct = opts.findIndex((o) => o.correct);
  const rewardRaw = Number(c.reward);
  return {
    correct_option: correct >= 0 ? correct : 0,
    options: opts.map((o) => ({ label: String(o.label || ""), rationale: String(o.rationale || "") })),
    teaching: String(c.teaching || ""),
    reward: Number.isFinite(rewardRaw) ? Math.max(1, Math.round(rewardRaw)) : 40,
  };
}

function scoreAudit(audit) {
  const v = (audit || "").toLowerCase();
  if (/pronta para revisão humana/.test(v) && !/requer correções/.test(v)) return "pass";
  if (/requer correções/.test(v)) return "fix";
  return "review";
}

async function loadCorpus(slug) {
  const gold = packForCourse(slug);
  const goldBlock = gold
    .map((r, i) => {
      return `[G${i + 1}] ${r.title}. ${r.authors}. ${r.journal} ${r.year}. ${r.doi ? "DOI " + r.doi : r.url || ""}\n${r.full_text || r.abstract || ""}`;
    })
    .join("\n\n---\n\n");

  const { data: sources } = await supabase
    .from("knowledge_sources")
    .select("title, authors, journal, year, doi, url, study_design, evidence_level, abstract, full_text, tags, notes")
    .or(`notes.ilike.%${slug}%,tags.cs.{${slug}},tags.cs.{ouro},tags.cs.{doutiva-ouro}`)
    .order("created_at", { ascending: false })
    .limit(24);

  const lib = (sources || [])
    .map((r, i) => {
      const body = (r.full_text || r.abstract || "").slice(0, 7000);
      return `[S${i + 1}] ${r.title}. ${r.authors ?? ""}. ${r.journal ?? ""} ${r.year ?? ""}. ${r.doi ? "DOI " + r.doi : r.url ?? ""}\n${body}`;
    })
    .join("\n\n---\n\n");

  return `=== FONTES OURO DO CURSO ===\n${goldBlock}\n\n=== BIBLIOTECA DOUTIVA ===\n${lib}`;
}

async function raiseCourse(slug) {
  const { raiseBarLesson } = await import("../src/lib/lesson-ai.server.ts");
  const courseDef = COURSES.find((c) => c.slug === slug);
  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();
  if (error) throw error;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, position, title, module_title, module_position, monograph, status")
    .eq("course_id", course.id)
    .order("position");

  const corpus = await loadCorpus(slug);
  mkdirSync(`/tmp/raise-bar/${slug}`, { recursive: true });
  mkdirSync(`scripts/course-exports/${slug}`, { recursive: true });
  const summary = [];

  for (const lesson of lessons || []) {
    if (onlyPos && !onlyPos.has(lesson.position)) continue;
    const spec = courseDef?.lessons?.find((l) => l.position === lesson.position);
    const topic = spec?.topic || lesson.title;
    const moduleTitle = spec?.module_title || lesson.module_title || "";
    console.log(`\n=== RAISE ${slug} #${lesson.position} ${topic.slice(0, 70)} ===`);
    const t0 = Date.now();
    let generated;
    try {
      generated = await raiseBarLesson({
        topic,
        courseTitle: course.title,
        moduleTitle,
        sources: corpus,
        notes: `${AUDIENCE}\n\nFoco:\n${spec?.extra || "Elevar rigor factual, regulatório e conduta BR."}`,
        existingMonograph: lesson.monograph || "",
      });
    } catch (e) {
      console.error("FAIL", slug, lesson.position, e?.message || e);
      summary.push({ position: lesson.position, error: String(e?.message || e) });
      continue;
    }
    const elapsed = Math.round((Date.now() - t0) / 1000);
    const clinical = sanitize(generated.clinicalCase);
    const patch = sanitize({
      title: generated.title || lesson.title,
      description: generated.description,
      evidence_level: generated.evidence_level,
      duration_minutes: Math.max(60, generated.duration_minutes || 75),
      module_title: moduleTitle || lesson.module_title,
      module_position: spec?.module_position || lesson.module_position,
      key_points: generated.key_points,
      refs: generated.refs,
      slides: generated.slides,
      monograph: generated.monograph,
      quick_ref: generated.quickRef,
      clinical_case: redactCase(clinical),
      reviewed_by: `Conselho editorial Doutiva · raise-bar v1 · ${new Date().toISOString().slice(0, 10)}`,
      reviewed_at: new Date().toISOString(),
      status: "published",
      updated_at: new Date().toISOString(),
    });
    const { error: uerr } = await supabase.from("lessons").update(patch).eq("id", lesson.id);
    if (uerr) {
      console.error("UPDATE_FAIL", uerr.message);
      summary.push({ position: lesson.position, error: uerr.message });
      continue;
    }
    const keys = sanitize(keysFromCase(clinical));
    await supabase.from("lesson_case_keys").upsert(
      {
        lesson_id: lesson.id,
        correct_option: keys.correct_option,
        options: keys.options,
        teaching: keys.teaching,
        reward: keys.reward,
      },
      { onConflict: "lesson_id" },
    );

    const verdict = scoreAudit(generated.audit);
    const snap = {
      position: lesson.position,
      title: patch.title,
      mono_len: patch.monograph.length,
      slides: patch.slides.length,
      elapsed_s: elapsed,
      audit_verdict: verdict,
      audit_head: (generated.audit.match(/Veredito[\s\S]{0,180}/i) || [""])[0].slice(0, 160),
    };
    summary.push(snap);
    writeFileSync(
      `/tmp/raise-bar/${slug}/${lesson.position}.json`,
      JSON.stringify({ snap, audit: generated.audit }, null, 2),
    );
    writeFileSync(
      `scripts/course-exports/${slug}/lesson-${lesson.position}.json`,
      JSON.stringify(
        {
          position: lesson.position,
          module: patch.module_title,
          title: patch.title,
          description: patch.description,
          duration_minutes: patch.duration_minutes,
          evidence_level: patch.evidence_level,
          key_points: patch.key_points,
          slides: patch.slides,
          monograph: patch.monograph,
          quick_ref: patch.quick_ref,
          clinical_case: clinical,
          refs: patch.refs,
          raise_bar: true,
          audit_verdict: verdict,
        },
        null,
        2,
      ),
    );
    console.log(
      "saved",
      snap.title.slice(0, 60),
      "mono",
      snap.mono_len,
      "slides",
      snap.slides,
      verdict,
      `${elapsed}s`,
    );
  }

  const { data: all } = await supabase.from("lessons").select("duration_minutes,status").eq("course_id", course.id);
  const dur = (all || []).filter((l) => l.status === "published").reduce((a, b) => a + (b.duration_minutes || 0), 0);
  await supabase
    .from("courses")
    .update({
      duration_minutes: dur,
      subtitle: (courseDef?.subtitle || "") + " · raise-bar v1",
      updated_at: new Date().toISOString(),
    })
    .eq("id", course.id);

  writeFileSync(`/tmp/raise-bar/${slug}/summary.json`, JSON.stringify(summary, null, 2));
  writeFileSync(`scripts/course-exports/${slug}/raise-bar-summary.json`, JSON.stringify(summary, null, 2));
  return summary;
}

async function main() {
  let slugs = [];
  if (courseArg) slugs = [courseArg];
  else if (modeAll) slugs = [...PRIORITY, ...SECONDARY];
  else slugs = PRIORITY;

  const all = {};
  for (const slug of slugs) {
    console.log("\n######## RAISE-BAR", slug, "########");
    all[slug] = await raiseCourse(slug);
  }
  writeFileSync("/tmp/raise-bar/ALL.json", JSON.stringify(all, null, 2));
  console.log("\nRAISE_BAR_DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
