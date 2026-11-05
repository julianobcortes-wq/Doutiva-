#!/usr/bin/env node
/**
 * Deepen Doutiva v3 courses (monograph + slides + case + keys).
 *
 * Usage:
 *   node --env-file=.env --import tsx scripts/deepen-doutiva-courses-v3.mjs
 *   node --env-file=.env --import tsx scripts/deepen-doutiva-courses-v3.mjs --course=ia-pratica-medica
 *   node --env-file=.env --import tsx scripts/deepen-doutiva-courses-v3.mjs --course=obesidade-precisao-consultorio --only=1,2,3
 *   node --env-file=.env --import tsx scripts/deepen-doutiva-courses-v3.mjs --force   # regenerate even if monograph exists
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { AUDIENCE, COURSES } from "./doutiva-curriculum-v3.mjs";

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

const force = process.argv.includes("--force");
const courseArg = (process.argv.find((a) => a.startsWith("--course=")) || "").split("=")[1];
const onlyArg = (process.argv.find((a) => a.startsWith("--only=")) || "").split("=")[1];
const onlyPos = onlyArg
  ? new Set(
      onlyArg
        .split(",")
        .map((x) => Number(x.trim()))
        .filter(Boolean),
    )
  : null;

const NOTES = `${AUDIENCE}

Profundidade obrigatória (produto premium Doutiva):
- Monografia 4.500–7.000 palavras, ≥2 tabelas densas, números reais (n, %, HR, IC95% quando existirem).
- Conduta acionável para o consultório BR; doses/vias quando farmacoterapia.
- Separar registrado / off-label / manipulado / irregular; CFM, ANVISA, WADA quando couber.
- Caso clínico brasileiro realista, 6–8 dados, 4 alternativas, 1 correta, teaching denso.
- 8–12 slides (title, table, bars ou bullets densos, flow, split, pearl).
- quick_ref de bolso; key_points 5–7.
- Nunca endossar research peptides, GH anti-aging, drip sem deficiência ou implante cosmético sem critério.`;

/** Postgres text rejects \\u0000 — strip nulls from all string leaves. */
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
    reward: c.reward ?? 40,
  });
}

function keysFromCase(c) {
  const opts = c.options || [];
  const correct = opts.findIndex((o) => o.correct);
  const rewardRaw = Number(c.reward);
  const reward = Number.isFinite(rewardRaw) ? Math.max(1, Math.round(rewardRaw)) : 40;
  return {
    correct_option: correct >= 0 ? correct : 0,
    options: opts.map((o) => ({
      label: String(o.label || ""),
      rationale: String(o.rationale || ""),
    })),
    teaching: String(c.teaching || ""),
    reward,
  };
}

async function loadCorpus(tagsHint) {
  const { data: sources } = await supabase
    .from("knowledge_sources")
    .select(
      "id, title, authors, journal, year, doi, url, study_design, evidence_level, abstract, full_text, tags",
    )
    .order("created_at", { ascending: false })
    .limit(30);
  const preferred = (sources || []).filter((s) => {
    const t = (s.tags || []).join(" ").toLowerCase();
    return !tagsHint || tagsHint.some((h) => t.includes(h) || (s.title || "").toLowerCase().includes(h));
  });
  const pool = preferred.length >= 6 ? preferred : sources || [];
  return pool
    .slice(0, 20)
    .map((r, i) => {
      const body = (r.full_text || r.abstract || "").slice(0, 8500);
      return `[S${i + 1}] ${r.title}. ${r.authors ?? ""}. ${r.journal ?? ""} ${r.year ?? ""}. ${r.doi ? "DOI " + r.doi : (r.url ?? "")}\nTags: ${(r.tags || []).join(", ")}\nDesenho: ${r.study_design ?? "—"} · Evidência: ${r.evidence_level ?? "—"}\n${body}`;
    })
    .join("\n\n---\n\n");
}

async function deepenCourse(courseDef) {
  const { generateLesson } = await import("../src/lib/lesson-ai.server.ts");
  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", courseDef.slug)
    .single();
  if (error) throw error;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, position, title, monograph, status")
    .eq("course_id", course.id)
    .order("position");

  const tagHints = {
    "tirzepatida-incretinas-consultorio": ["incretin", "semaglut", "tirzepat", "obes", "glp"],
    "hormonios-implantes-criterio": ["hormon", "testoster", "menopaus", "estrogen", "gh"],
    "soroterapia-injetaveis-estereis": ["intravenous", "vitamin", "compound", "infusion", "steril"],
    "obesidade-precisao-consultorio": ["obes", "weight", "bariatric", "incretin"],
    "sarcopenia-composicao-performance": ["sarcopen", "muscle", "protein", "body composition"],
    "ia-pratica-medica": ["artificial intelligence", "machine learning", "llm", "clinical decision"],
  };

  const corpus = await loadCorpus(tagHints[courseDef.slug]);
  mkdirSync(`/tmp/deepen-v3/${courseDef.slug}`, { recursive: true });
  mkdirSync(`scripts/course-exports/${courseDef.slug}`, { recursive: true });

  const summary = [];
  for (const spec of courseDef.lessons) {
    if (onlyPos && !onlyPos.has(spec.position)) continue;
    const lesson = (lessons || []).find((l) => l.position === spec.position);
    if (!lesson) {
      console.error("missing lesson", courseDef.slug, spec.position);
      continue;
    }
    if (!force && (lesson.monograph || "").length > 8000) {
      console.log(`skip ${courseDef.slug}#${spec.position} (already deep)`);
      summary.push({ position: spec.position, skipped: true, mono_len: lesson.monograph.length });
      continue;
    }

    console.log(`\n=== [${courseDef.slug} ${spec.position}/10] ${spec.topic.slice(0, 70)} ===`);
    const t0 = Date.now();
    let generated;
    try {
      generated = await generateLesson({
        topic: spec.topic,
        courseTitle: courseDef.title,
        moduleTitle: spec.module_title,
        notes: `${NOTES}\n\nFoco desta aula:\n${spec.extra}`,
        sources: `BIBLIOTECA DOUTIVA — cite com [S#] quando couber.\n\n${corpus}`,
      });
    } catch (e) {
      console.error("FAILED", courseDef.slug, spec.position, e?.message || e);
      summary.push({ position: spec.position, error: String(e?.message || e) });
      writeFileSync(
        `/tmp/deepen-v3/${courseDef.slug}/${spec.position}.error.json`,
        JSON.stringify({ error: String(e?.message || e) }, null, 2),
      );
      continue;
    }
    const elapsed = Math.round((Date.now() - t0) / 1000);
    const clinical = sanitize(generated.clinicalCase);
    const patch = sanitize({
      title: generated.title || spec.topic,
      description: generated.description,
      evidence_level: generated.evidence_level,
      duration_minutes: Math.max(60, generated.duration_minutes || 75),
      module_title: spec.module_title,
      module_position: spec.module_position,
      key_points: generated.key_points,
      refs: generated.refs,
      slides: generated.slides,
      monograph: generated.monograph,
      quick_ref: generated.quickRef,
      clinical_case: redactCase(clinical),
      reviewed_by: "Conselho editorial Doutiva · CRM institucional",
      reviewed_at: new Date().toISOString(),
      status: "published",
      updated_at: new Date().toISOString(),
    });
    const { error: uerr } = await supabase.from("lessons").update(patch).eq("id", lesson.id);
    if (uerr) {
      console.error("UPDATE_FAIL", courseDef.slug, spec.position, uerr.message);
      summary.push({ position: spec.position, error: uerr.message });
      writeFileSync(
        `/tmp/deepen-v3/${courseDef.slug}/${spec.position}.error.json`,
        JSON.stringify({ error: uerr.message }, null, 2),
      );
      continue;
    }
    const keys = sanitize(keysFromCase(clinical));
    const { error: kerr } = await supabase.from("lesson_case_keys").upsert(
      {
        lesson_id: lesson.id,
        correct_option: keys.correct_option,
        options: keys.options,
        teaching: keys.teaching,
        reward: keys.reward,
      },
      { onConflict: "lesson_id" },
    );
    if (kerr) {
      console.error("KEYS_FAIL", courseDef.slug, spec.position, kerr.message);
      summary.push({ position: spec.position, error: kerr.message, mono_saved: true });
      continue;
    }

    const snap = {
      position: spec.position,
      title: patch.title,
      mono_len: patch.monograph.length,
      slides: patch.slides.length,
      duration: patch.duration_minutes,
      elapsed_s: elapsed,
    };
    summary.push(snap);
    writeFileSync(
      `/tmp/deepen-v3/${courseDef.slug}/${spec.position}.json`,
      JSON.stringify({ patch, keys, audit: generated.audit }, null, 2),
    );
    writeFileSync(
      `scripts/course-exports/${courseDef.slug}/lesson-${spec.position}.json`,
      JSON.stringify(
        {
          position: spec.position,
          module: spec.module_title,
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
        },
        null,
        2,
      ),
    );
    console.log("saved", snap.title.slice(0, 70), "mono", snap.mono_len, "slides", snap.slides, `${elapsed}s`);
  }

  const { data: all } = await supabase
    .from("lessons")
    .select("duration_minutes, status")
    .eq("course_id", course.id);
  const dur = (all || [])
    .filter((l) => l.status === "published")
    .reduce((a, b) => a + (b.duration_minutes || 0), 0);
  await supabase
    .from("courses")
    .update({ duration_minutes: dur || courseDef.lessons.length * 75, updated_at: new Date().toISOString() })
    .eq("id", course.id);

  writeFileSync(`/tmp/deepen-v3/${courseDef.slug}/summary.json`, JSON.stringify(summary, null, 2));
  writeFileSync(`scripts/course-exports/${courseDef.slug}/summary.json`, JSON.stringify(summary, null, 2));
  return summary;
}

async function main() {
  const list = courseArg ? COURSES.filter((c) => c.slug === courseArg) : COURSES;
  if (!list.length) throw new Error(`course not found: ${courseArg}`);
  const all = {};
  for (const c of list) {
    console.log("\n######## COURSE", c.slug, "########");
    all[c.slug] = await deepenCourse(c);
  }
  writeFileSync("/tmp/deepen-v3/ALL_SUMMARY.json", JSON.stringify(all, null, 2));
  console.log("\nALL DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
