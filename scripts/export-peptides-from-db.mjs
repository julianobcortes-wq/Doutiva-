#!/usr/bin/env node
/** Dump published Peptídeos lessons from Supabase into scripts/peptides-exports/ + snapshot. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

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

const { data: course } = await supabase
  .from("courses")
  .select("id, title, duration_minutes, description, subtitle")
  .eq("slug", "peptideos-medicina-de-precisao")
  .single();

const { data: lessons, error } = await supabase
  .from("lessons")
  .select(
    "id, position, module_title, module_position, title, description, duration_minutes, evidence_level, key_points, refs, slides, monograph, quick_ref, clinical_case, status",
  )
  .eq("course_id", course.id)
  .order("position");
if (error) throw error;

const { data: keys } = await supabase.from("lesson_case_keys").select("*");
const keyBy = Object.fromEntries((keys || []).map((k) => [k.lesson_id, k]));

mkdirSync("scripts/peptides-exports", { recursive: true });
const summary = [];
let mono = 0;
let slides = 0;
for (const L of lessons || []) {
  const k = keyBy[L.id];
  const clinical =
    L.clinical_case && k
      ? {
          ...L.clinical_case,
          options: (k.options || []).map((o, i) => ({
            label: o.label,
            correct: i === k.correct_option,
            rationale: o.rationale || "",
          })),
          teaching: k.teaching,
          reward: k.reward,
        }
      : L.clinical_case;
  const row = {
    position: L.position,
    module: L.module_title,
    module_position: L.module_position,
    title: L.title,
    description: L.description,
    duration_minutes: L.duration_minutes,
    evidence_level: L.evidence_level,
    key_points: L.key_points,
    slides: L.slides,
    monograph: L.monograph,
    quick_ref: L.quick_ref,
    clinical_case: clinical,
    refs: L.refs,
    status: L.status,
  };
  writeFileSync(`scripts/peptides-exports/lesson-${L.position}.json`, JSON.stringify(row, null, 2));
  const m = (L.monograph || "").length;
  const s = Array.isArray(L.slides) ? L.slides.length : 0;
  mono += m;
  slides += s;
  summary.push({
    position: L.position,
    title: L.title,
    duration_minutes: L.duration_minutes,
    mono_len: m,
    slides: s,
    module: L.module_title,
  });
}

writeFileSync(
  "scripts/peptides-deep-snapshot.json",
  JSON.stringify(
    {
      course: {
        title: course.title,
        subtitle: course.subtitle,
        duration_minutes: course.duration_minutes,
        description: course.description,
        lessons: lessons.length,
        mono_total: mono,
        slides_total: slides,
      },
      lessons: summary,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ lessons: lessons.length, mono, slides, hours: course.duration_minutes / 60 }, null, 2));
