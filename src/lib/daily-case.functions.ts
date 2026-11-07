import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  loadDailyCasesForGrading,
  toPublicDailyCase,
  type PublicDailyCase,
} from "@/lib/daily-case";
import { gradeClinicalCase, type CaseGradeResult } from "@/lib/clinical-case-public";
import {
  pickPersonalDailyCase,
  recordCaseOutcome,
} from "@/lib/brain/preceptor-session.server";
import type { ConfidenceLabel } from "@/lib/brain/types";

export type PersonalPublicCase = PublicDailyCase & {
  source: "map" | "calendar";
  mapReady: boolean;
  topicIds: string[];
};

/** Public case of the day — map-driven when mastery ready. */
export const getTodayCase = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PersonalPublicCase> => {
    const pick = await pickPersonalDailyCase(context.supabase as any, context.userId);
    return {
      ...toPublicDailyCase(pick.daily),
      source: pick.source,
      mapReady: pick.mapReady,
      topicIds: pick.topicIds,
    };
  });

/** Review queue as public cases (no answer keys). */
export const listReviewCases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PublicDailyCase[]> => {
    const { loadDailyCases } = await import("@/lib/daily-case");
    const cases = await loadDailyCases(context.supabase as any);
    const real = cases.filter((c) => !c.key.startsWith("static-"));
    return (real.length ? real : cases).map(toPublicDailyCase);
  });

/** Server decides if the chosen option is correct; browser only sends option index. */
export const answerDailyCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { caseKey: string; option: number; confidence?: ConfidenceLabel; topicIds?: string[] }) => {
      if (typeof input?.caseKey !== "string" || !Number.isInteger(input?.option) || input.option < 0) {
        throw new Error("Resposta inválida");
      }
      const confidence = input.confidence;
      if (confidence && !["sei", "acho", "nao_sei"].includes(confidence)) {
        throw new Error("Confiança inválida");
      }
      return {
        caseKey: input.caseKey.slice(0, 100),
        option: input.option,
        confidence: confidence as ConfidenceLabel | undefined,
        topicIds: Array.isArray(input.topicIds) ? input.topicIds.slice(0, 5) : undefined,
      };
    },
  )
  .handler(async ({ data, context }) => {
    const cases = await loadDailyCasesForGrading(context.supabase as any);
    const pick = await pickPersonalDailyCase(context.supabase as any, context.userId);
    const match =
      cases.find((c) => c.key === data.caseKey) ??
      (pick.daily.key === data.caseKey
        ? (await loadDailyCasesForGrading(context.supabase as any)).find((c) => c.key === data.caseKey)
        : undefined);
    // Allow today's personal pick OR same key in pool (reload-safe)
    const graded = match ?? cases.find((c) => c.key === data.caseKey);
    if (!graded) throw new Error("Este não é o caso de hoje. Recarregue a página.");
    const grade = gradeClinicalCase(graded.c, data.option);

    type Award = {
      awarded: boolean;
      correct: boolean;
      xp_awarded: number;
      credits_awarded: number;
      xp: number;
      credits: number;
      streak: number;
    };

    const { hasServiceRole } = await import("@/integrations/supabase/publishable.server");
    let award: Award | null = null;

    if (hasServiceRole()) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: r, error } = await supabaseAdmin.rpc("award_daily_case", {
          _user_id: context.userId,
          _case_key: data.caseKey,
          _correct: grade.correct,
        });
        if (!error && r) award = r as Award;
        else if (error) console.error("award_daily_case", error);
      } catch (e) {
        console.error("award_daily_case unavailable", e);
      }
    }

    if (!award) {
      const { data: r, error } = await context.supabase.rpc("submit_daily_case" as any, {
        _case_key: data.caseKey,
        _correct: grade.correct,
      });
      if (!error && r) award = r as Award;
      else if (error) console.error("submit_daily_case", error);
    }

    // Feed the brain map
    try {
      await recordCaseOutcome({
        userId: context.userId,
        caseKey: data.caseKey,
        correct: grade.correct,
        confidence: data.confidence,
        topicIds: data.topicIds?.length ? data.topicIds : pick.topicIds,
        supabase: context.supabase as any,
      });
    } catch (e) {
      console.error("recordCaseOutcome", e);
    }

    if (!award) {
      const { data: progress } = await context.supabase
        .from("user_progress")
        .select("xp, credits, streak")
        .eq("user_id", context.userId)
        .maybeSingle();
      return {
        awarded: false,
        correct: grade.correct,
        xp_awarded: 0,
        credits_awarded: 0,
        xp: progress?.xp ?? 0,
        credits: progress?.credits ?? 0,
        streak: progress?.streak ?? 0,
        grade,
      };
    }

    return { ...award, grade };
  });

/** Grade a review card without awarding daily-case XP (SM-2 stays client-side). */
export const answerReviewCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { caseKey: string; option: number }) => {
    if (typeof input?.caseKey !== "string" || !Number.isInteger(input?.option) || input.option < 0) {
      throw new Error("Resposta inválida");
    }
    return { caseKey: input.caseKey.slice(0, 100), option: input.option };
  })
  .handler(async ({ data, context }): Promise<CaseGradeResult> => {
    const cases = await loadDailyCasesForGrading(context.supabase as any);
    const match = cases.find((c) => c.key === data.caseKey);
    if (!match) throw new Error("Caso não encontrado.");
    return gradeClinicalCase(match.c, data.option);
  });

/** Grade the clinical case of a published lesson (academy practice). */
export const gradeLessonCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { lessonId: string; option: number }) => {
    if (typeof input?.lessonId !== "string" || !Number.isInteger(input?.option) || input.option < 0) {
      throw new Error("Resposta inválida");
    }
    return { lessonId: input.lessonId, option: input.option };
  })
  .handler(async ({ data, context }): Promise<CaseGradeResult> => {
    const { gradeLessonById } = await import("@/lib/lesson-case-keys.server");
    return gradeLessonById(data.lessonId, data.option, context.supabase as any);
  });
