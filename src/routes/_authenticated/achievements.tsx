import { createFileRoute } from "@tanstack/react-router";
import { useValleyProfile } from "@/lib/use-city-profile";
import { achievementsFor } from "@/lib/valley";
import { AchievementBadge } from "@/components/city/city-ui";
import { ClassBadge } from "@/components/valley/valley-ui";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({
    meta: [
      { title: "Marcos da jornada — Doutiva" },
      { name: "description", content: "Conquistas simbólicas que marcam a sua evolução dentro do Doutiva." },
      { property: "og:title", content: "Marcos da jornada — Doutiva" },
      { property: "og:description", content: "Os marcos que registram o que você já atravessou." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { profile, hydrated } = useValleyProfile();
  const expert = hydrated && profile.user_class === "valley_expert";
  const list = achievementsFor(profile.user_class);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 pb-28 md:pb-12">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {expert ? "Sua trajetória de atuação" : "Sua história"}
        </span>
        {hydrated && <ClassBadge userClass={profile.user_class} />}
      </div>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">
        {expert ? "Marcos da sua contribuição." : "Marcos da jornada."}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {expert
          ? "Registros do que você sustentou em outras pessoas dentro da Doutiva."
          : "Conquistas não são troféus de competição — são registros do que você atravessou."}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {list.map((a) => (
          <AchievementBadge key={a.id} name={a.name} desc={a.desc} unlocked={profile.achievements.includes(a.id)} />
        ))}
      </div>
    </div>
  );
}