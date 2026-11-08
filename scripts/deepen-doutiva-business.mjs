#!/usr/bin/env node
/**
 * Deepen Doutiva business courses (monograph + slides + case + keys).
 * Usage:
 *   node --env-file=.env --import tsx scripts/deepen-doutiva-business.mjs
 *   node --env-file=.env --import tsx scripts/deepen-doutiva-business.mjs --course=precificacao-margem-consultorio
 *   node --env-file=.env --import tsx scripts/deepen-doutiva-business.mjs --only=1,2
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { AUDIENCE_BUSINESS, BUSINESS_COURSES } from "./doutiva-curriculum-business.mjs";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const force = process.argv.includes("--force");
const courseArg = (process.argv.find((a) => a.startsWith("--course=")) || "").split("=")[1];
const onlyArg = (process.argv.find((a) => a.startsWith("--only=")) || "").split("=")[1];
const onlyPos = onlyArg
  ? new Set(onlyArg.split(",").map((x) => Number(x.trim())).filter(Boolean))
  : null;

const NOTES = `${AUDIENCE_BUSINESS}

Profundidade obrigatória (produto premium Doutiva Negócios):
- Monografia 3.500–5.500 palavras, ≥2 tabelas densas, números e exemplos BR.
- Templates acionáveis (script, checklist, planilha mental).
- Caso clínico-empresarial brasileiro, 4 alternativas, 1 correta, teaching denso.
- 8–10 slides (title, table, bars/bullets, flow, split, pearl).
- quick_ref de bolso; key_points 5–7.
- Sem menção a marcas de farmácia/indústria; ética CFM no digital quando couber.`;

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

  mkdirSync(`/tmp/deepen-biz/${courseDef.slug}`, { recursive: true });
  mkdirSync(`scripts/course-exports/${courseDef.slug}`, { recursive: true });

  const summary = [];
  for (const spec of courseDef.lessons) {
    if (onlyPos && !onlyPos.has(spec.position)) continue;
    const lesson = (lessons || []).find((l) => l.position === spec.position);
    if (!lesson) {
      console.error("missing lesson", courseDef.slug, spec.position);
      continue;
    }
    if (!force && (lesson.monograph || "").length > 5000) {
      console.log(`skip ${courseDef.slug}#${spec.position}`);
      summary.push({ position: spec.position, skipped: true });
      continue;
    }

    console.log(`\n=== [${courseDef.slug} ${spec.position}] ${spec.topic.slice(0, 70)} ===`);
    const t0 = Date.now();
    let generated;
    try {
      generated = await generateLesson({
        topic: spec.topic,
        courseTitle: courseDef.title,
        moduleTitle: spec.module_title,
        notes: `${NOTES}\n\nFoco desta aula:\n${spec.extra}`,
        sources:
          "Contexto Doutiva Negócios: use boas práticas de gestão de clínicas médicas no Brasil, ética CFM, e exemplos numéricos realistas. Não invente leis; quando citar norma, seja cauteloso.",
      });
    } catch (e) {
      console.error("FAILED", courseDef.slug, spec.position, e?.message || e);
      summary.push({ position: spec.position, error: String(e?.message || e) });
      continue;
    }
    const elapsed = Math.round((Date.now() - t0) / 1000);
    const clinical = sanitize(generated.clinicalCase);
    const patch = sanitize({
      title: generated.title || spec.topic,
      description: generated.description,
      evidence_level: generated.evidence_level || "Prática / gestão clínica",
      duration_minutes: Math.max(45, generated.duration_minutes || 60),
      module_title: spec.module_title,
      module_position: spec.module_position,
      key_points: generated.key_points,
      refs: generated.refs,
      slides: generated.slides,
      monograph: generated.monograph,
      quick_ref: generated.quickRef,
      clinical_case: redactCase(clinical),
      reviewed_by: "Conselho editorial Doutiva · Negócios médicos",
      reviewed_at: new Date().toISOString(),
      status: "published",
      updated_at: new Date().toISOString(),
    });
    const { error: uerr } = await supabase.from("lessons").update(patch).eq("id", lesson.id);
    if (uerr) {
      console.error("UPDATE_FAIL", uerr.message);
      summary.push({ position: spec.position, error: uerr.message });
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

    const snap = {
      position: spec.position,
      title: patch.title,
      mono_len: (patch.monograph || "").length,
      slides: (patch.slides || []).length,
      elapsed_s: elapsed,
    };
    summary.push(snap);
    writeFileSync(
      `scripts/course-exports/${courseDef.slug}/lesson-${spec.position}.json`,
      JSON.stringify({ ...snap, monograph: patch.monograph?.slice(0, 500) }, null, 2),
    );
    console.log("saved", snap.title.slice(0, 60), "mono", snap.mono_len, `${elapsed}s`);
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
    .update({
      duration_minutes: dur || courseDef.lessons.length * 60,
      featured: true,
      published: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", course.id);

  writeFileSync(`/tmp/deepen-biz/${courseDef.slug}/summary.json`, JSON.stringify(summary, null, 2));
  return summary;
}

async function main() {
  const list = courseArg
    ? BUSINESS_COURSES.filter((c) => c.slug === courseArg)
    : BUSINESS_COURSES;
  if (!list.length) throw new Error(`course not found: ${courseArg}`);
  const all = {};
  for (const c of list) {
    console.log("\n########", c.slug, "########");
    all[c.slug] = await deepenCourse(c);
  }
  writeFileSync("/tmp/deepen-biz/ALL_SUMMARY.json", JSON.stringify(all, null, 2));
  console.log("\nALL DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
