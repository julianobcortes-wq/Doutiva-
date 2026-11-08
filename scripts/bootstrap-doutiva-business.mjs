#!/usr/bin/env node
/**
 * Insert/update the five Doutiva business courses + lesson stubs.
 * Usage: node --env-file=.env scripts/bootstrap-doutiva-business.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { BUSINESS_COURSES } from "./doutiva-curriculum-business.mjs";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function upsertCourse(c) {
  const duration = c.lessons.reduce((a, l) => a + 60, 0);
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
    duration_minutes: 60,
    evidence_level: "Prática / gestão clínica",
    content: `# ${L.topic}\n\nConteúdo em geração pelo deepen Doutiva Business.`,
    key_points: [],
    refs: [],
    updated_at: new Date().toISOString(),
  };

  if (existing?.id && (existing.monograph || "").length > 4000) {
    await supabase
      .from("lessons")
      .update({
        module_position: L.module_position,
        module_title: L.module_title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    return { id: existing.id, skipped: true };
  }

  if (existing?.id) {
    await supabase
      .from("lessons")
      .update({ ...base, status: existing.status === "published" ? "published" : "draft" })
      .eq("id", existing.id);
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
  let n = 0;
  for (const c of BUSINESS_COURSES) {
    const id = await upsertCourse(c);
    console.log("course", c.slug, id);
    for (const L of c.lessons) {
      const r = await upsertLesson(id, L);
      n++;
      console.log("  ", L.position, r.skipped ? "keep" : "stub", L.topic.slice(0, 64));
    }
  }
  console.log("done lessons", n, "courses", BUSINESS_COURSES.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
