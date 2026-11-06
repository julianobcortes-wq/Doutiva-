import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { redactClinicalCaseJson } from "@/lib/clinical-case-public";
import { accessForCourse, isFreeCourseSlug, subscriptionIsActive } from "@/lib/freemium";

async function loadSubStatus(
  supabase: { from: (t: string) => any },
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("user_subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.status as string | undefined) ?? null;
}

export const listCourses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("courses")
      .select("id, slug, title, subtitle, category, level, duration_minutes, featured, instructor_name, cover_url")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: true });
    if (error) throw error;
    const status = await loadSubStatus(context.supabase, context.userId);
    const paid = subscriptionIsActive(status);
    return (data ?? []).map((c) => ({
      ...c,
      free: isFreeCourseSlug(c.slug),
      access: accessForCourse(c.slug, status),
      subscribed: paid,
    }));
  });

export const getCourseBySlug = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: course, error } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    if (!course) return null;

    // Omit full monograph from the course payload — treatises are large and only
    // needed in "Aprofundar". Player loop uses slides / case / key_points / quick_ref.
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, title, description, video_url, duration_minutes, position, module_title, module_position, content, key_points, refs, evidence_level, slides, clinical_case, quick_ref, reviewed_by, reviewed_at")
      .eq("course_id", course.id)
      .order("position", { ascending: true });

    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", course.id)
      .eq("user_id", userId)
      .maybeSingle();

    let progressIds: string[] = [];
    if (lessons && lessons.length > 0) {
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .in("lesson_id", lessons.map((l) => l.id));
      progressIds = (progress ?? []).map((p) => p.lesson_id);
    }

    // Lightweight ids-only probe so Aprofundar CTA shows without shipping treatises.
    const { data: monoIds } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", course.id)
      .not("monograph", "is", null)
      .neq("monograph", "");
    const hasMono = new Set((monoIds ?? []).map((r) => r.id as string));

    // Strip answer keys from clinical_case before the student client receives the course.
    const safeLessons = (lessons ?? []).map((l) => ({
      ...l,
      monograph: null as string | null,
      has_monograph: hasMono.has(l.id),
      clinical_case: redactClinicalCaseJson(l.clinical_case) ?? null,
    }));

    const status = await loadSubStatus(supabase, userId);
    const access = accessForCourse(course.slug as string, status);
    const locked = access === "locked";

    // Locked courses: keep syllabus metadata, strip session payloads.
    const lessonsOut = locked
      ? safeLessons.map((l) => ({
          ...l,
          content: null,
          key_points: null,
          refs: null,
          slides: null,
          clinical_case: null,
          quick_ref: null,
          video_url: null,
          has_monograph: false,
        }))
      : safeLessons;

    return {
      ...course,
      lessons: lessonsOut,
      enrolled: !!enrollment,
      progress: progressIds,
      access,
      free: isFreeCourseSlug(course.slug as string),
      subscribed: subscriptionIsActive(status),
    };
  });

/** Full treatise for Aprofundar — loaded on demand, not with the guided session. */
export const getLessonMonograph = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { lessonId: string }) => z.object({ lessonId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: lesson, error } = await context.supabase
      .from("lessons")
      .select("id, title, monograph, refs, quick_ref, courses!inner(slug)")
      .eq("id", data.lessonId)
      .maybeSingle();
    if (error) throw error;
    if (!lesson) throw new Error("Aula não encontrada");
    const slug = (lesson as { courses?: { slug?: string } | { slug?: string }[] }).courses;
    const courseSlug = Array.isArray(slug) ? slug[0]?.slug : slug?.slug;
    if (courseSlug) {
      const status = await loadSubStatus(context.supabase, context.userId);
      if (accessForCourse(courseSlug, status) === "locked") {
        throw new Error("Monografia disponível em Protocolos.");
      }
    }
    return {
      id: lesson.id as string,
      title: lesson.title as string,
      monograph: (lesson.monograph as string | null) ?? "",
      refs: (lesson.refs as { citation: string; url?: string }[] | null) ?? [],
      quickRef: (lesson.quick_ref as string | null) ?? "",
    };
  });

export const enrollInCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseId: string }) => z.object({ courseId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: course, error: courseErr } = await context.supabase
      .from("courses")
      .select("slug")
      .eq("id", data.courseId)
      .maybeSingle();
    if (courseErr) throw courseErr;
    if (!course) throw new Error("Curso não encontrado");
    const status = await loadSubStatus(context.supabase, context.userId);
    if (accessForCourse(course.slug as string, status) === "locked") {
      throw new Error("Esta trilha exige Protocolos. Assine para matricular.");
    }
    const { error } = await context.supabase
      .from("enrollments")
      .insert({ course_id: data.courseId, user_id: context.userId });
    if (error && !error.message.includes("duplicate")) throw error;
    return { ok: true };
  });

export const toggleLessonComplete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { lessonId: string }) => z.object({ lessonId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("id")
      .eq("lesson_id", data.lessonId)
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) {
      await supabase.from("lesson_progress").delete().eq("id", existing.id);
      return { completed: false };
    }
    await supabase.from("lesson_progress").insert({ lesson_id: data.lessonId, user_id: userId });
    // XP/Créditos só na primeira conclusão de cada aula (trava no banco).
    const { data: reward } = await supabase.rpc("award_lesson", { _lesson_id: data.lessonId });
    return { completed: true, awarded: Boolean((reward as { awarded?: boolean } | null)?.awarded) };
  });