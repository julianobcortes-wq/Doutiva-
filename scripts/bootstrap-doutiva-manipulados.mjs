#!/usr/bin/env node
/**
 * Insert/update the flagship Manipulados Injetáveis course + lesson stubs.
 * Usage: node --env-file=.env scripts/bootstrap-doutiva-manipulados.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { MANIPULADOS_COURSE } from "./doutiva-curriculum-manipulados.mjs";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function upsertCourse(c) {
  const duration = c.lessons.length * 75;
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
    instructor_name: c.instructor_name,
    instructor_title: c.instructor_title,
    cover_url: `/covers/${c.slug}.jpg`,
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
    evidence_level: "A–D (conforme tema · regulatório A)",
    content: `# ${L.topic}\n\nConteúdo em geração pelo deepen Doutiva · Manipulados.`,
    key_points: [],
    refs: [],
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    if ((existing.monograph || "").length > 2500 && existing.status === "published") {
      const { error } = await supabase
        .from("lessons")
        .update({
          module_title: L.module_title,
          module_position: L.module_position,
          description: base.description,
          updated_at: base.updated_at,
        })
        .eq("id", existing.id);
      if (error) throw error;
      return existing.id;
    }
    const { error } = await supabase
      .from("lessons")
      .update({ ...base, status: existing.status || "draft" })
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }
  const { data, error } = await supabase
    .from("lessons")
    .insert({ ...base, status: "draft" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function main() {
  const c = MANIPULADOS_COURSE;
  console.log("upsert course", c.slug);
  const id = await upsertCourse(c);
  for (const L of c.lessons) {
    const lid = await upsertLesson(id, L);
    console.log("  lesson", L.position, lid.slice(0, 8), L.topic.slice(0, 60));
  }
  console.log("DONE", c.lessons.length, "lessons");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
