import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useValleyProfile } from "@/lib/use-city-profile";
import { useValleyGame } from "@/lib/use-valley-game";
import { VALLEY_DISCLAIMER } from "@/lib/valley";
import { StageCard } from "@/components/valley/valley-ui";
import { Disclaimer } from "@/components/city/city-ui";
import {
  DailyMissionPanel, GameLoopSummary, RewardReveal, StreakRecovery, WeeklyProgress,
} from "@/components/valley/game-ui";
import { missionKindLabel, richMissionsFor, type MissionKind, type RichMission } from "@/lib/economy";

export const Route = createFileRoute("/_authenticated/missions")({
  head: () => ({
    meta: [
      { title: "Missões — Doutiva" },
      { name: "description", content: "Missões diárias, semanais, de jornada, exploração, conhecimento e épicas — com motivo, dificuldade e recompensa claros." },
      { property: "og:title", content: "Missões — Doutiva" },
      { property: "og:description", content: "Ações claras que transformam objetivos abstratos em evolução real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MissionsPage,
});

const kinds: (MissionKind | "todas")[] = [
  "todas", "diaria", "semanal", "jornada", "exploracao", "conhecimento", "social", "expert", "especial", "epica",
];

function MissionsPage() {
  const { profile, update, addXp } = useValleyProfile();
  const { state, addLifePoints } = useValleyGame();
  const [kind, setKind] = useState<MissionKind | "todas">("todas");
  const [reveal, setReveal] = useState<{ title: string; detail: string; rewards: string[] } | null>(null);

  const expert = profile.user_class === "valley_expert";
  const accent = expert ? "sage" : "gold";
  const all = richMissionsFor(profile.user_class);
  const list = kind === "todas" ? all : all.filter((m) => m.kind === kind);
  const done = profile.completed_missions;

  function complete(m: RichMission) {
    const isDone = done.includes(m.id);
    update({ completed_missions: isDone ? done.filter((x) => x !== m.id) : [...done, m.id] });
    addXp(isDone ? -m.xp : m.xp);
    if (isDone) return;
    addLifePoints(m.life_points, "earned", `Missão concluída — ${m.title}`, missionKindLabel[m.kind]);
    setReveal({
      title: "Missão concluída",
      detail: `${m.title} — ${m.next_step}`,
      rewards: [`+${m.xp} XP`, `+${m.life_points} LP`, `${m.attribute} em alta`],
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-28 md:pb-12">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {expert ? "Rotina de atuação" : "Ritual diário"}
      </span>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">
        {expert ? "Entregas que sustentam outras jornadas." : "Ações pequenas, evolução real."}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Nenhuma missão existe só para dar pontos. Cada uma diz por que importa, o que muda em você e qual é o próximo passo.
      </p>
      <div className="mt-6"><GameLoopSummary accent={accent} /></div>

      <div className="mt-8 flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-full border px-4 py-1.5 text-xs transition ${
              kind === k
                ? accent === "sage" ? "border-sage bg-sage/10 text-sage" : "border-gold bg-gold/10 text-gold"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {k === "todas" ? "Todas" : missionKindLabel[k]}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <DailyMissionPanel missions={list} done={done} onComplete={complete} accent={accent} />
        <div className="space-y-6">
          <StageCard profile={profile} />
          <WeeklyProgress
            accent={accent}
            items={[
              { label: expert ? "Entregas da semana" : "Ações da semana", value: done.length, goal: Math.max(5, all.length) },
              { label: "XP do ciclo", value: state.season_xp, goal: 2000 },
              { label: "Dias ativos", value: state.active_days_month, goal: 30 },
            ]}
          />
          <StreakRecovery
            current={profile.streak}
            best={state.best_streak}
            activeDays={state.active_days_month}
            accent={accent}
          />
        </div>
      </div>

      <Disclaimer text={VALLEY_DISCLAIMER} />

      <RewardReveal
        open={!!reveal}
        title={reveal?.title ?? ""}
        detail={reveal?.detail ?? ""}
        rewards={reveal?.rewards ?? []}
        accent={accent}
        onClose={() => setReveal(null)}
      />
    </div>
  );
}
