import type { ClinicalCase, CaseOption } from "@/content/lesson-types";
import { toCase } from "@/content/lesson-normalize";
import { gradeClinicalCase, type CaseGradeResult } from "@/lib/clinical-case-public";

type LessonRow = {
  id: string;
  position: number;
  clinical_case: unknown;
  monograph?: string | null;
  quick_ref?: string | null;
  slides?: unknown;
  courses?: { slug?: string } | { slug?: string }[] | null;
};

/** Rebuild a full ClinicalCase using private keys when the public JSON was redacted. */
export async function loadFullClinicalCase(lesson: LessonRow): Promise<ClinicalCase | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const publicCase = toCase(lesson.clinical_case);
  const { data: key } = await supabaseAdmin
    .from("lesson_case_keys" as any)
    .select("correct_option, options, teaching, reward")
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  if (key && publicCase) {
    const keyOpts = Array.isArray((key as any).options) ? ((key as any).options as CaseOption[]) : [];
    const options: CaseOption[] =
      keyOpts.length === publicCase.options.length
        ? keyOpts.map((o, i) => ({
            label: publicCase.options[i]?.label || o.label,
            correct: !!o.correct || i === (key as any).correct_option,
            rationale: o.rationale ?? "",
          }))
        : publicCase.options.map((o, i) => ({
            label: o.label,
            correct: i === (key as any).correct_option,
            rationale: "",
          }));
    return {
      ...publicCase,
      options,
      teaching: (key as any).teaching || publicCase.teaching || "",
      reward: Number((key as any).reward) || publicCase.reward || 40,
    };
  }

  // Legacy rows not yet split / static resolve
  if (publicCase?.options.some((o) => o.correct)) return publicCase;
  const course = Array.isArray(lesson.courses) ? lesson.courses[0] : lesson.courses;
  const { resolveRich } = await import("@/content/lesson-normalize");
  return resolveRich(lesson, course?.slug ?? "")?.clinicalCase ?? publicCase;
}

export async function gradeLessonById(lessonId: string, option: number): Promise<CaseGradeResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: lesson, error } = await supabaseAdmin
    .from("lessons")
    .select("id, position, clinical_case, monograph, quick_ref, slides, courses(slug)")
    .eq("id", lessonId)
    .maybeSingle();
  if (error || !lesson) throw new Error("Aula não encontrada.");
  const full = await loadFullClinicalCase(lesson as any);
  if (!full?.vignette) throw new Error("Caso clínico indisponível.");
  return gradeClinicalCase(full, option);
}
