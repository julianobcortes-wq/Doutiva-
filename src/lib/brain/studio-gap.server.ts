/**
 * Estúdio vivo — se não há material, cria rascunho com curadoria.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { topicHasPublishedLesson, retrieveCorpus } from "@/lib/brain/librarian.server";

export type GapRow = {
  id: string;
  topic_id: string;
  demand_count: number;
  status: string;
  draft_lesson_id: string | null;
  published_lesson_id: string | null;
  notes: string | null;
};

/** Register demand for a topic; open gap if missing published lesson. */
export async function registerTopicDemand(
  admin: SupabaseClient<any>,
  topicId: string,
  note?: string,
): Promise<{ action: "reuse" | "gap" | "queued"; gapId?: string; lessonIds?: string[] }> {
  const existing = await topicHasPublishedLesson(admin, topicId);
  if (existing.has) {
    return { action: "reuse", lessonIds: existing.lessonIds };
  }

  const { data: open } = await admin
    .from("content_gaps")
    .select("id, demand_count, status, notes")
    .eq("topic_id", topicId)
    .in("status", ["open", "drafting", "in_review"])
    .maybeSingle();

  if (open) {
    await admin
      .from("content_gaps")
      .update({
        demand_count: (open.demand_count ?? 1) + 1,
        updated_at: new Date().toISOString(),
        notes: note ?? (open as { notes?: string | null }).notes ?? null,
      })
      .eq("id", open.id);
    return { action: "queued", gapId: open.id };
  }

  const { data: created, error } = await admin
    .from("content_gaps")
    .insert({
      topic_id: topicId,
      demand_count: 1,
      status: "open",
      notes: note ?? null,
    })
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return { action: "gap", gapId: created?.id };
}

/** Create a draft lesson for an open gap (admin / service). */
export async function draftLessonForGap(
  admin: SupabaseClient<any>,
  gapId: string,
  opts?: { courseId?: string; generatedBy?: string },
): Promise<{ lessonId: string | null; error?: string }> {
  const { data: gap } = await admin
    .from("content_gaps")
    .select("id, topic_id, status, clinical_topics(title, specialty, summary)")
    .eq("id", gapId)
    .maybeSingle();
  if (!gap) return { lessonId: null, error: "Gap não encontrado" };
  if (!["open", "drafting"].includes(gap.status)) {
    return { lessonId: null, error: "Gap não está aberto para draft" };
  }

  const topic = (gap as any).clinical_topics;
  const title = topic?.title ?? "Tema clínico";
  const corpus = await retrieveCorpus(admin, title, 6);
  const sourceNotes = corpus
    .map((h, i) => `[${i + 1}] (${h.kind}) ${h.title}${h.snippet ? " — " + h.snippet : ""}`)
    .join("\n");

  let courseId = opts?.courseId;
  if (!courseId) {
    const { data: course } = await admin
      .from("courses")
      .select("id")
      .eq("published", true)
      .order("featured", { ascending: false })
      .limit(1)
      .maybeSingle();
    courseId = course?.id;
  }
  if (!courseId) return { lessonId: null, error: "Nenhum curso para anexar o draft" };

  const { data: pos } = await admin
    .from("lessons")
    .select("position")
    .eq("course_id", courseId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  let lessonPayload: Record<string, unknown> = {
    course_id: courseId,
    title: `[Rascunho IA] ${title}`,
    description: topic?.summary ?? "Gerado pelo Estúdio vivo a partir de gap do mapa.",
    position: (pos?.position ?? 0) + 1,
    module_title: "Cérebro Doutiva · gaps",
    module_position: 99,
    status: "draft",
    content: `Rascunho gerado automaticamente para o tema: ${title}.\n\nFontes encontradas:\n${sourceNotes || "(sem hits — enriquecer na curadoria)"}`,
  };

  // Optional full AI generation when keys exist
  try {
    const { generateLesson } = await import("@/lib/lesson-ai.server");
    const lesson = await generateLesson({
      topic: title,
      courseTitle: "Doutiva",
      moduleTitle: topic?.specialty ?? "Clínica",
      sources: sourceNotes,
      notes: "Gap do mapa clínico — aula canônica após curadoria humana.",
    });
    lessonPayload = {
      ...lessonPayload,
      title: lesson.title || lessonPayload.title,
      description: lesson.description || lessonPayload.description,
      content:
        (lesson as { content?: string }).content ||
        lesson.monograph?.slice(0, 4000) ||
        lessonPayload.content,
      slides: lesson.slides ?? null,
      clinical_case: lesson.clinicalCase ?? null,
      quick_ref: lesson.quickRef ?? null,
      monograph: lesson.monograph ?? null,
      key_points: lesson.key_points ?? null,
      refs: lesson.refs ?? null,
      evidence_level: lesson.evidence_level ?? null,
      duration_minutes: lesson.duration_minutes ?? 40,
    };
  } catch (e) {
    console.warn("draftLessonForGap AI fallback to skeleton", e);
  }

  await admin.from("content_gaps").update({ status: "drafting", updated_at: new Date().toISOString() }).eq("id", gapId);

  const { data: lesson, error } = await admin
    .from("lessons")
    .insert(lessonPayload)
    .select("id")
    .maybeSingle();
  if (error || !lesson) {
    await admin.from("content_gaps").update({ status: "open" }).eq("id", gapId);
    return { lessonId: null, error: error?.message ?? "Falha ao criar aula" };
  }

  await admin.from("lesson_topics").upsert({
    lesson_id: lesson.id,
    topic_id: gap.topic_id,
    weight: 1,
  });
  await admin.from("lesson_origins").upsert({
    lesson_id: lesson.id,
    source: "ai_gap",
    gap_id: gapId,
    created_for_user: opts?.generatedBy ?? null,
  });
  await admin
    .from("content_gaps")
    .update({
      status: "in_review",
      draft_lesson_id: lesson.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gapId);

  return { lessonId: lesson.id };
}

export async function listContentGaps(admin: SupabaseClient<any>): Promise<GapRow[]> {
  const { data, error } = await admin
    .from("content_gaps")
    .select("id, topic_id, demand_count, status, draft_lesson_id, published_lesson_id, notes, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data as GapRow[]) ?? [];
}

export async function publishGapLesson(
  admin: SupabaseClient<any>,
  gapId: string,
  reviewerName: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data: gap } = await admin
    .from("content_gaps")
    .select("id, draft_lesson_id, status")
    .eq("id", gapId)
    .maybeSingle();
  if (!gap?.draft_lesson_id) return { ok: false, error: "Sem draft" };

  const { error } = await admin
    .from("lessons")
    .update({
      status: "published",
      reviewed_by: reviewerName,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", gap.draft_lesson_id);
  if (error) return { ok: false, error: error.message };

  await admin
    .from("content_gaps")
    .update({
      status: "published",
      published_lesson_id: gap.draft_lesson_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gapId);
  return { ok: true };
}
