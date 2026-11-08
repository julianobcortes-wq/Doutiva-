#!/usr/bin/env node
/**
 * Expand Hormônios/Implantes course: update meta + upsert lessons 11–16 (formulário).
 * Usage: node --env-file=.env scripts/bootstrap-doutiva-hormonios.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { HORMONIOS_COURSE_META, HORMONIOS_EXTRA_LESSONS } from "./doutiva-curriculum-hormonios.mjs";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const meta = HORMONIOS_COURSE_META;
  const { data: course, error } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", meta.slug)
    .single();
  if (error) throw error;

  const { error: uerr } = await supabase
    .from("courses")
    .update({
      title: meta.title,
      subtitle: meta.subtitle,
      description: meta.description,
      category: meta.category,
      level: meta.level,
      instructor_name: meta.instructor_name,
      instructor_title: meta.instructor_title,
      featured: true,
      published: true,
      cover_url: `/covers/${meta.slug}.jpg`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", course.id);
  if (uerr) throw uerr;
  console.log("updated course meta", meta.slug);

  for (const L of HORMONIOS_EXTRA_LESSONS) {
    const { data: existing } = await supabase
      .from("lessons")
      .select("id, status, monograph")
      .eq("course_id", course.id)
      .eq("position", L.position)
      .maybeSingle();

    const base = {
      course_id: course.id,
      position: L.position,
      module_position: L.module_position,
      module_title: L.module_title,
      title: L.topic,
      description: L.extra.slice(0, 280),
      duration_minutes: 75,
      evidence_level: "A–D (conforme tema · CFM/ANVISA)",
      content: `# ${L.topic}\n\nConteúdo em geração pelo deepen Doutiva · Hormônios.`,
      key_points: [],
      refs: [],
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      if ((existing.monograph || "").length > 2500 && existing.status === "published") {
        await supabase
          .from("lessons")
          .update({
            module_title: L.module_title,
            module_position: L.module_position,
            description: base.description,
            updated_at: base.updated_at,
          })
          .eq("id", existing.id);
        console.log("  keep", L.position, existing.id.slice(0, 8));
        continue;
      }
      await supabase.from("lessons").update({ ...base, status: existing.status || "draft" }).eq("id", existing.id);
      console.log("  update", L.position, existing.id.slice(0, 8));
    } else {
      const { data, error: ierr } = await supabase
        .from("lessons")
        .insert({ ...base, status: "draft" })
        .select("id")
        .single();
      if (ierr) throw ierr;
      console.log("  insert", L.position, data.id.slice(0, 8), L.topic.slice(0, 50));
    }
  }
  console.log("DONE extras", HORMONIOS_EXTRA_LESSONS.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
