#!/usr/bin/env node
/**
 * Seed published courses + lesson stubs on production using an admin user JWT
 * (no service_role required — admin RLS write policies).
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_PUBLISHABLE_KEY=... ADMIN_EMAIL=... ADMIN_PASSWORD=... \
 *     node scripts/seed-prod-catalog-as-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { COURSES as V3 } from "./doutiva-curriculum-v3.mjs";
import { SCIENTIFIC_TRACKS } from "./doutiva-curriculum-scientific-tracks.mjs";
import { BUSINESS_COURSES } from "./doutiva-curriculum-business.mjs";

const url = process.env.SUPABASE_URL || "https://nflhfjyyaefhxeesvrge.supabase.co";
const key =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_vdb-ThUqi8mx-RuqdDzyig_ylCK2QIr";
const email = process.env.ADMIN_EMAIL || "juliano@jubex.com.br";
const password = process.env.ADMIN_PASSWORD || "Disciplina82@";

const catalog = [...V3, ...SCIENTIFIC_TRACKS, ...BUSINESS_COURSES];

function lessonTitle(L) {
  return L.topic || L.title || "Aula";
}

async function main() {
  const anon = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: auth, error: authErr } = await anon.auth.signInWithPassword({ email, password });
  if (authErr || !auth.session) throw authErr || new Error("login failed");

  const { data: isAdmin, error: roleErr } = await anon.rpc("has_role", {
    _user_id: auth.user.id,
    _role: "admin",
  });
  if (roleErr) throw roleErr;
  if (!isAdmin) throw new Error("user is not admin");

  const sb = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${auth.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let coursesUpserted = 0;
  let lessonsUpserted = 0;

  for (const c of catalog) {
    const duration = (c.lessons || []).reduce((a, l) => a + (l.duration_minutes || 75), 0);
    const row = {
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle ?? null,
      description: c.description ?? null,
      category: c.category ?? null,
      level: c.level ?? "Avançado",
      duration_minutes: duration || 0,
      published: true,
      featured: true,
      instructor_name: "Conselho editorial Doutiva",
      instructor_title: "Endocrinologia · Nutrologia · Prática clínica",
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await sb.from("courses").select("id").eq("slug", c.slug).maybeSingle();
    let courseId = existing?.id;
    if (courseId) {
      const { error } = await sb.from("courses").update(row).eq("id", courseId);
      if (error) throw new Error(`course update ${c.slug}: ${error.message}`);
    } else {
      const { data, error } = await sb.from("courses").insert(row).select("id").single();
      if (error) throw new Error(`course insert ${c.slug}: ${error.message}`);
      courseId = data.id;
    }
    coursesUpserted++;

    for (const L of c.lessons || []) {
      const position = L.position;
      const { data: existingLesson } = await sb
        .from("lessons")
        .select("id, status")
        .eq("course_id", courseId)
        .eq("position", position)
        .maybeSingle();

      const patch = {
        course_id: courseId,
        position,
        module_position: L.module_position ?? 1,
        module_title: L.module_title ?? null,
        title: lessonTitle(L),
        description: (L.extra || L.description || "").slice(0, 400) || null,
        duration_minutes: L.duration_minutes || 75,
        evidence_level: L.evidence_level || "A–B (conforme tema)",
        status: "published",
        updated_at: new Date().toISOString(),
      };
      // Don't wipe existing rich content on update
      if (existingLesson?.id) {
        const { error } = await sb.from("lessons").update(patch).eq("id", existingLesson.id);
        if (error) throw new Error(`lesson update ${c.slug}#${position}: ${error.message}`);
      } else {
        const { error } = await sb.from("lessons").insert({
          ...patch,
          content: `# ${lessonTitle(L)}\n\n${L.extra || "Conteúdo Doutiva — em aprofundamento editorial."}`,
          key_points: [],
          refs: [],
        });
        if (error) throw new Error(`lesson insert ${c.slug}#${position}: ${error.message}`);
      }
      lessonsUpserted++;
    }
    console.log(`OK  ${c.slug} (${(c.lessons || []).length} aulas)`);
  }

  const { count } = await sb
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("published", true);
  console.log(`\nDone. courses_upserted=${coursesUpserted} lessons_upserted=${lessonsUpserted} published_now=${count}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
