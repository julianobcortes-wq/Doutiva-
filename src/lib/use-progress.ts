import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Progress = {
  xp: number;
  credits: number;
  streak: number;
  sessionsToday: number;
  dailyGoal: number;
  goalMet: boolean;
};

const EVT = "doutiva:progress";
const DAILY_GOAL = 1;

function todaySP() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Progresso real do médico (XP, Créditos, Sequência, meta diária) lido do banco. */
export function useProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      return setProgress({ xp: 0, credits: 0, streak: 0, sessionsToday: 0, dailyGoal: DAILY_GOAL, goalMet: false });
    }

    const [{ data }, goalRpc] = await Promise.all([
      supabase.from("user_progress").select("xp, credits, streak, last_active_date").eq("user_id", u.user.id).maybeSingle(),
      supabase.rpc("get_daily_session_goal"),
    ]);

    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const alive = !!data && (data.last_active_date === fmt(today) || data.last_active_date === fmt(y));

    let sessionsToday = 0;
    let dailyGoal = DAILY_GOAL;
    let goalMet = false;
    if (!goalRpc.error && goalRpc.data) {
      const g = goalRpc.data as {
        sessions_today?: number;
        daily_goal?: number;
        goal_met?: boolean;
      };
      sessionsToday = Number(g.sessions_today) || 0;
      dailyGoal = Number(g.daily_goal) || DAILY_GOAL;
      goalMet = !!g.goal_met;
    } else {
      // Fallback if RPC not yet available: count session beats today.
      const start = `${todaySP()}T00:00:00-03:00`;
      const { count } = await supabase
        .from("session_beat_awards")
        .select("lesson_id", { count: "exact", head: true })
        .eq("user_id", u.user.id)
        .eq("beat", "session")
        .gte("created_at", new Date(start).toISOString());
      sessionsToday = count ?? 0;
      goalMet = sessionsToday >= dailyGoal;
    }

    setProgress({
      xp: data?.xp ?? 0,
      credits: data?.credits ?? 0,
      streak: alive ? (data?.streak ?? 0) : 0,
      sessionsToday,
      dailyGoal,
      goalMet,
    });
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(EVT, load);
    return () => window.removeEventListener(EVT, load);
  }, [load]);

  return progress;
}

export function refreshProgress() {
  window.dispatchEvent(new Event(EVT));
}
