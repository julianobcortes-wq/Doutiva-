import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Progress = { xp: number; credits: number; streak: number };
const EVT = "doutiva:progress";

/** Progresso real do médico (XP, Créditos, Sequência) lido do banco. */
export function useProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return setProgress({ xp: 0, credits: 0, streak: 0 });
    const { data } = await supabase.from("user_progress").select("xp, credits, streak, last_active_date").eq("user_id", u.user.id).maybeSingle();
    if (!data) return setProgress({ xp: 0, credits: 0, streak: 0 });
    // Sequência quebra se o último dia ativo foi antes de ontem.
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const y = new Date(today); y.setDate(y.getDate() - 1);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const alive = data.last_active_date === fmt(today) || data.last_active_date === fmt(y);
    setProgress({ xp: data.xp, credits: data.credits, streak: alive ? data.streak : 0 });
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
