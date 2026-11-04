import { createFileRoute } from "@tanstack/react-router";
import { useValleyProfile } from "@/lib/use-city-profile";
import { useValleyGame } from "@/lib/use-valley-game";
import { EventBanner, SeasonPass, SeasonProgress } from "@/components/valley/game-ui";
import { currentSeason, dynamicEvents } from "@/lib/economy";

export const Route = createFileRoute("/_authenticated/season")({
  head: () => ({
    meta: [
      { title: "Temporada e eventos — Doutiva" },
      { name: "description", content: "Temporada ativa, recompensas do passe e eventos dinâmicos que movimentam a cidade nesta semana." },
      { property: "og:title", content: "Temporada e eventos — Doutiva" },
      { property: "og:description", content: "Camadas novas a cada ciclo, sem apagar o que você já conquistou." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SeasonPage,
});

function SeasonPage() {
  const { profile } = useValleyProfile();
  const { state } = useValleyGame();
  const accent = profile.user_class === "valley_expert" ? "sage" : "gold";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-28 md:pb-10">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Ciclo atual</span>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">A Doutiva em movimento.</h1>

      <div className="mt-8"><SeasonProgress season={currentSeason} xp={state.season_xp} accent={accent} /></div>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Passe da temporada</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          O progresso permanente continua após o fim do ciclo. Temporadas somam camadas, nunca invalidam conquistas.
        </p>
        <div className="mt-6">
          <SeasonPass season={currentSeason} xp={state.season_xp} claimed={state.claimed_season_rewards} accent={accent} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Eventos dinâmicos</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {dynamicEvents.map((e) => <EventBanner key={e.id} event={e} accent={accent} />)}
        </div>
      </section>
    </div>
  );
}
