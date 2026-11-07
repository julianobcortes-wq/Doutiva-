#!/usr/bin/env node
/**
 * Insert/update the six Doutiva v3 courses + lesson stubs.
 * Usage: node --env-file=.env scripts/bootstrap-doutiva-courses-v3.mjs
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { COURSES } from "./doutiva-curriculum-v3.mjs";

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

async function upsertCourse(c) {
  const duration = c.lessons.reduce((a, l) => a + 75, 0);
  const row = {
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    description: c.description,
    category: c.category,
    level: c.level,
    duration_minutes: duration,
    published: true,
    featured: true,
    instructor_name: "Conselho editorial Doutiva",
    instructor_title: "Endocrinologia · Nutrologia · Prática clínica",
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from("courses").select("id").eq("slug", c.slug).maybeSingle();
  if (existing?.id) {
    const { error } = await supabase.from("courses").update(row).eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }
  const { data, error } = await supabase.from("courses").insert(row).select("id").single();
  if (error) throw error;
  return data.id;
}

async function upsertLesson(courseId, L) {
  const { data: existing } = await supabase
    .from("lessons")
    .select("id, status, monograph")
    .eq("course_id", courseId)
    .eq("position", L.position)
    .maybeSingle();

  const base = {
    course_id: courseId,
    position: L.position,
    module_position: L.module_position,
    module_title: L.module_title,
    title: L.topic,
    description: L.extra.slice(0, 280),
    duration_minutes: 75,
    evidence_level: "A–B (conforme tema)",
    content: `# ${L.topic}\n\nConteúdo em geração pelo deepen Doutiva v3.`,
    key_points: [],
    refs: [],
    updated_at: new Date().toISOString(),
  };

  // Don't wipe rich content if already deepened
  if (existing?.id && (existing.monograph || "").length > 5000) {
    const { error } = await supabase
      .from("lessons")
      .update({
        module_position: L.module_position,
        module_title: L.module_title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw error;
    return { id: existing.id, skipped: true };
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("lessons")
      .update({ ...base, status: existing.status === "published" ? "published" : "draft" })
      .eq("id", existing.id);
    if (error) throw error;
    return { id: existing.id, skipped: false };
  }
  const { data, error } = await supabase
    .from("lessons")
    .insert({ ...base, status: "draft" })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id, skipped: false };
}

async function main() {
  let lessons = 0;
  for (const c of COURSES) {
    const id = await upsertCourse(c);
    console.log("course", c.slug, id);
    for (const L of c.lessons) {
      const r = await upsertLesson(id, L);
      lessons++;
      console.log("  lesson", L.position, r.skipped ? "(keep content)" : "stub", L.topic.slice(0, 60));
    }
  }
  console.log("DONE courses", COURSES.length, "lessons", lessons);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
