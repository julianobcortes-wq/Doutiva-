import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type SessionBeat = "slides" | "keys" | "case" | "session";

export type BeatAwardResult = {
  awarded: boolean;
  beat: SessionBeat;
  xp: number;
  xp_total: number;
  credits: number;
  streak: number;
  sessions_today: number;
  daily_goal: number;
  goal_met: boolean;
  review_due_days: number | null;
};

export type DailySessionGoal = {
  sessions_today: number;
  daily_goal: number;
  goal_met: boolean;
  streak: number;
  xp: number;
  credits: number;
  last_active_date: string | null;
};

export const getDailySessionGoal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DailySessionGoal> => {
    const { data, error } = await context.supabase.rpc("get_daily_session_goal");
    if (error) throw error;
    const r = (data ?? {}) as Partial<DailySessionGoal>;
    return {
      sessions_today: Number(r.sessions_today) || 0,
      daily_goal: Number(r.daily_goal) || 1,
      goal_met: !!r.goal_met,
      streak: Number(r.streak) || 0,
      xp: Number(r.xp) || 0,
      credits: Number(r.credits) || 0,
      last_active_date: (r.last_active_date as string | null) ?? null,
    };
  });

export const awardSessionBeat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { lessonId: string; beat: SessionBeat; correct?: boolean | null }) =>
    z
      .object({
        lessonId: z.string().uuid(),
        beat: z.enum(["slides", "keys", "case", "session"]),
        correct: z.boolean().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }): Promise<BeatAwardResult> => {
    const { data: result, error } = await context.supabase.rpc("award_session_beat", {
      _lesson_id: data.lessonId,
      _beat: data.beat,
      _correct: data.correct ?? null,
    });
    if (error) throw error;
    const r = (result ?? {}) as Partial<BeatAwardResult>;
    return {
      awarded: !!r.awarded,
      beat: (r.beat as SessionBeat) || data.beat,
      xp: Number(r.xp) || 0,
      xp_total: Number(r.xp_total) || 0,
      credits: Number(r.credits) || 0,
      streak: Number(r.streak) || 0,
      sessions_today: Number(r.sessions_today) || 0,
      daily_goal: Number(r.daily_goal) || 1,
      goal_met: !!r.goal_met,
      review_due_days: r.review_due_days == null ? null : Number(r.review_due_days),
    };
  });
