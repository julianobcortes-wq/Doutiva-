import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Json } from "@/integrations/supabase/types";
import { resolveRich, toCase } from "@/content/lesson-normalize";

type Ctx = { supabase: any; userId: string };

async function assertAdmin({ supabase, userId }: Ctx) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Acesso restrito ao corpo docente Doutiva.");
}

export const studioMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const { data: adminExists } = await context.supabase.rpc("admin_exists");
    return { isAdmin: !!isAdmin, adminExists: !!adminExists };
  });

export const studioClaimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_first_admin");
    if (error) throw error;
    return { ok: !!data };
  });

export const studioListCourses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("courses")
      .select("id, slug, title, category, published, featured, updated_at, lessons(id, status)")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((c) => ({
      id: c.id, slug: c.slug, title: c.title, category: c.category, published: c.published, featured: c.featured,
      lessons: c.lessons.length,
      inReview: c.lessons.filter((l) => l.status === "review").length,
      drafts: c.lessons.filter((l) => l.status === "draft").length,
    }));
  });

const courseInput = z.object({
  id: z.string().uuid().nullable(),
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  subtitle: z.string().max(400).nullable(),
  description: z.string().max(4000).nullable(),
  category: z.string().max(80).nullable(),
  level: z.string().max(60),
  instructor_name: z.string().max(200).nullable(),
  instructor_title: z.string().max(300).nullable(),
  cover_url: z.string().max(1000).nullable(),
  duration_minutes: z.number().int().min(0).max(100000),
  published: z.boolean(),
  featured: z.boolean(),
});

export const studioGetCourse = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: course, error } = await context.supabase.from("courses").select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    if (!course) return null;
    const { data: lessons } = await context.supabase
      .from("lessons")
      .select("id, title, module_title, module_position, position, status, duration_minutes, reviewed_by")
      .eq("course_id", data.id)
      .order("position");
    return { course, lessons: lessons ?? [] };
  });

export const studioSaveCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof courseInput>) => courseInput.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { id, ...row } = data;
    if (id) {
      const { error } = await context.supabase.from("courses").update({ ...row, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw new Error(error.message.includes("duplicate") ? "Já existe um curso com esse endereço." : error.message);
      return { id };
    }
    const { data: created, error } = await context.supabase.from("courses").insert(row).select("id").single();
    if (error) throw new Error(error.message.includes("duplicate") ? "Já existe um curso com esse endereço." : error.message);
    return { id: created.id as string };
  });

export const studioCreateLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseId: string; moduleTitle: string | null }) => z.object({ courseId: z.string().uuid(), moduleTitle: z.string().max(200).nullable() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: last } = await context.supabase.from("lessons").select("position, module_title, module_position").eq("course_id", data.courseId).order("position", { ascending: false }).limit(1).maybeSingle();
    const { data: created, error } = await context.supabase.from("lessons").insert({
      course_id: data.courseId,
      title: "Nova aula",
      status: "draft",
      position: (last?.position ?? 0) + 1,
      module_title: data.moduleTitle ?? last?.module_title ?? "Módulo 1",
      module_position: last?.module_position ?? 1,
    }).select("id").single();
    if (error) throw error;
    return { id: created.id as string };
  });

export const studioGetLesson = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: lesson, error } = await context.supabase.from("lessons").select("*, courses(id, slug, title)").eq("id", data.id).maybeSingle();
    if (error) throw error;
    if (!lesson) return null;
    const course = lesson.courses as { id: string; slug: string; title: string };
    // Rehydrate private keys for the editor (admins only).
    try {
      const { loadFullClinicalCase } = await import("@/lib/lesson-case-keys.server");
      const full = await loadFullClinicalCase({
        id: lesson.id,
        position: lesson.position,
        clinical_case: lesson.clinical_case,
        monograph: lesson.monograph,
        quick_ref: lesson.quick_ref,
        slides: lesson.slides,
        courses: { slug: course.slug },
      });
      if (full) (lesson as any).clinical_case = full;
    } catch {
      /* keys table may not exist until migration 0014 */
    }
    const rich = resolveRich(lesson, course.slug);
    return { lesson, course, rich };
  });

const slideAny = z.record(z.string(), z.unknown());
const lessonInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).nullable(),
  module_title: z.string().max(200).nullable(),
  module_position: z.number().int().min(1).max(999),
  position: z.number().int().min(0).max(9999),
  duration_minutes: z.number().int().min(0).max(1000),
  evidence_level: z.string().max(200).nullable(),
  video_url: z.string().max(1000).nullable(),
  key_points: z.array(z.string().max(500)).max(20),
  refs: z.array(z.object({ citation: z.string().max(1000), url: z.string().max(1000).optional() })).max(60),
  slides: z.array(slideAny).max(40),
  monograph: z.string().max(200000),
  quick_ref: z.string().max(40000),
  clinical_case: slideAny.nullable(),
  status: z.enum(["draft", "review", "published"]),
  reviewed_by: z.string().max(300).nullable(),
});

export const studioSaveLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof lessonInput>) => lessonInput.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { id, ...row } = data;
    if (row.status === "published" && !row.reviewed_by?.trim()) {
      throw new Error("Para publicar, informe o médico revisor responsável.");
    }
    const { data: prev } = await context.supabase.from("lessons").select("status, reviewed_by").eq("id", id).maybeSingle();
    const reviewedNow = row.status === "published" && (prev?.status !== "published" || prev?.reviewed_by !== row.reviewed_by);

    // Persist answer keys privately; store only the public case shape on lessons.
    let publicCase: Json | null = row.clinical_case as Json;
    if (row.clinical_case && typeof row.clinical_case === "object") {
      const full = toCase(row.clinical_case);
      if (full?.options.some((o) => o.correct)) {
        const { redactClinicalCaseJson } = await import("@/lib/clinical-case-public");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const correctOption = full.options.findIndex((o) => o.correct);
        await supabaseAdmin.from("lesson_case_keys" as any).upsert({
          lesson_id: id,
          correct_option: Math.max(0, correctOption),
          options: full.options as unknown as Json,
          teaching: full.teaching,
          reward: full.reward,
          updated_at: new Date().toISOString(),
        });
        publicCase = redactClinicalCaseJson(full) as unknown as Json;
      }
    }

    const { error } = await context.supabase.from("lessons").update({
      ...row,
      slides: row.slides as Json,
      clinical_case: publicCase,
      refs: row.refs as Json,
      updated_at: new Date().toISOString(),
      ...(reviewedNow ? { reviewed_at: new Date().toISOString() } : {}),
    }).eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const studioDeleteLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("lessons").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const studioGenerateLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topic: string; courseTitle: string; moduleTitle: string; sources: string; notes: string; sourceIds?: string[] }) =>
    z.object({ topic: z.string().min(3).max(500), courseTitle: z.string().max(300), moduleTitle: z.string().max(300), sources: z.string().max(80000), notes: z.string().max(4000), sourceIds: z.array(z.string().uuid()).max(40).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { generateLesson } = await import("@/lib/lesson-ai.server");
    try {
      let corpus = "";
      if (data.sourceIds?.length) {
        const { data: rows } = await context.supabase.from("knowledge_sources")
          .select("title, authors, journal, year, doi, url, study_design, evidence_level, abstract, full_text").in("id", data.sourceIds);
        const per = Math.floor(150000 / Math.max(1, rows?.length ?? 1));
        corpus = (rows ?? []).map((r: any, i: number) =>
          `[S${i + 1}] ${r.title}. ${r.authors ?? ""}. ${r.journal ?? ""} ${r.year ?? ""}. ${r.doi ? "DOI " + r.doi : r.url ?? ""}\nDesenho: ${r.study_design ?? "—"} · Evidência: ${r.evidence_level ?? "—"}\n${(r.full_text || r.abstract || "").slice(0, per)}`).join("\n\n---\n\n");
      }
      const sources = corpus
        ? `BIBLIOTECA CIENTÍFICA DOUTIVA — cite cada afirmação relevante com [S#]; as referências finais devem ser exatamente estas fontes.\n\n${corpus}${data.sources ? "\n\n---\nMaterial adicional do mentor:\n" + data.sources : ""}`
        : data.sources;
      return { lesson: await generateLesson({ ...data, sources }), error: null as string | null };
    } catch (e) {
      console.error("generateLesson", e);
      return { lesson: null, error: e instanceof Error && e.message.length < 200 ? e.message : "Falha ao gerar a aula." };
    }
  });

export const studioReviewQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("lessons").select("id, title, review_due_at, updated_at, courses(title)")
      .eq("status", "review").order("review_due_at", { ascending: true, nullsFirst: false });
    if (error) throw error;
    return (data ?? []).map((l: any) => ({ id: l.id as string, title: l.title as string, course: l.courses?.title as string, due: (l.review_due_at ?? null) as string | null }));
  });

export const studioLessonVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("lesson_versions").select("id, version, changed_at, changed_by, status, title")
      .eq("lesson_id", data.id).order("version", { ascending: false }).limit(50);
    if (error) throw error;
    return (rows ?? []).map((r: any) => ({ ...r, mine: r.changed_by === context.userId }));
  });

const RESTORABLE = ["title", "description", "module_title", "module_position", "position", "duration_minutes", "evidence_level", "video_url", "key_points", "refs", "slides", "monograph", "quick_ref", "clinical_case"] as const;

export const studioRestoreVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { versionId: string }) => z.object({ versionId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: v, error } = await context.supabase.from("lesson_versions").select("lesson_id, snapshot").eq("id", data.versionId).maybeSingle();
    if (error || !v) throw new Error("Versão não encontrada.");
    const snap = v.snapshot as Record<string, unknown>;
    const patch: Record<string, unknown> = { status: "draft", updated_at: new Date().toISOString() };
    for (const k of RESTORABLE) if (k in snap) patch[k] = snap[k];
    const { error: e2 } = await context.supabase.from("lessons").update(patch as never).eq("id", v.lesson_id);
    if (e2) throw e2;
    return { ok: true };
  });

export const studioMentorCredentials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase.from("mentor_credentials").select("*").order("verified").order("updated_at", { ascending: false });
    return data ?? [];
  });

export const studioVerifyMentor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; verified: boolean }) => z.object({ userId: z.string().uuid(), verified: z.boolean() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("mentor_credentials").update({ verified: data.verified, updated_at: new Date().toISOString() }).eq("user_id", data.userId);
    if (error) throw error;
    return { ok: true };
  });
