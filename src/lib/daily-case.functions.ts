import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  loadDailyCases,
  loadDailyCasesForGrading,
  caseIndexForDate,
  toPublicDailyCase,
  type PublicDailyCase,
} from "@/lib/daily-case";
import { gradeClinicalCase, type CaseGradeResult } from "@/lib/clinical-case-public";

/** Public case of the day — no answer key. */
export const getTodayCase = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PublicDailyCase> => {
    const cases = await loadDailyCases(context.supabase as any);
    const today = cases[caseIndexForDate(new Date(), cases.length)];
    return toPublicDailyCase(today);
  });

/** Review queue as public cases (no answer keys). */
export const listReviewCases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PublicDailyCase[]> => {
    const cases = await loadDailyCases(context.supabase as any);
    const real = cases.filter((c) => !c.key.startsWith("static-"));
    return (real.length ? real : cases).map(toPublicDailyCase);
  });

/** Server decides if the chosen option is correct; browser only sends option index. */
export const answerDailyCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { caseKey: string; option: number }) => {
    if (typeof input?.caseKey !== "string" || !Number.isInteger(input?.option) || input.option < 0) {
      throw new Error("Resposta inválida");
    }
    return { caseKey: input.caseKey.slice(0, 100), option: input.option };
  })
  .handler(async ({ data, context }) => {
    const cases = await loadDailyCasesForGrading();
    const now = Date.now();
    const valid = [now, now - 86_400_000].map((t) =>
      cases[caseIndexForDate(new Date(t), cases.length)],
    );
    const match = valid.find((c) => c.key === data.caseKey);
    if (!match) throw new Error("Este não é o caso de hoje. Recarregue a página.");
    const grade = gradeClinicalCase(match.c, data.option);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: r, error } = await supabaseAdmin.rpc("award_daily_case", {
      _user_id: context.userId,
      _case_key: data.caseKey,
      _correct: grade.correct,
    });
    if (error) {
      console.error("award_daily_case", error);
      throw new Error("Não foi possível registrar seu progresso.");
    }
    return {
      ...(r as {
        awarded: boolean;
        correct: boolean;
        xp_awarded: number;
        credits_awarded: number;
        xp: number;
        credits: number;
        streak: number;
      }),
      grade,
    };
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
  .handler(async ({ data }): Promise<CaseGradeResult> => {
    const cases = await loadDailyCasesForGrading();
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
  .handler(async ({ data }): Promise<CaseGradeResult> => {
    const { gradeLessonById } = await import("@/lib/lesson-case-keys.server");
    return gradeLessonById(data.lessonId, data.option);
  });
