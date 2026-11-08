import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useValleyProfile } from "@/lib/use-city-profile";
import { skillsFor } from "@/lib/valley";
import { HumanEvolutionMap, SkillTree, StageCard } from "@/components/valley/valley-ui";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({
    meta: [
      { title: "Árvore de Habilidades — Doutiva" },
      { name: "description", content: "Desbloqueie habilidades por dimensão e acompanhe a evolução da sua jornada na Doutiva." },
      { property: "og:title", content: "Árvore de Habilidades — Doutiva" },
      { property: "og:description", content: "Ramos de habilidades que você desbloqueia conforme evolui." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const { profile, update, addXp, hydrated } = useValleyProfile();
  const expert = hydrated && profile.user_class === "valley_expert";
  const total = skillsFor(profile.user_class).length;
  const unlocked = profile.unlocked_skills.filter((id) =>
    skillsFor(profile.user_class).some((s) => s.id === id),
  ).length;

  function unlock(id: string) {
    if (profile.unlocked_skills.includes(id)) return;
    update({ unlocked_skills: [...profile.unlocked_skills, id] });
    addXp(60);
    toast.success("Habilidade desbloqueada. +60 XP");
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-28 md:pb-12">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {expert ? "Seu método" : "Sua árvore"}
      </span>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">
        {expert ? "Trilha de método e maturidade." : "Habilidades que sustentam a evolução."}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {expert
          ? `Cada dimensão de contribuição tem um ramo de método. Você libera novas competências conforme amplia sua atuação — ${unlocked} de ${total} ativas.`
          : `Cada dimensão tem um ramo. Você desbloqueia habilidades conforme avança de nível — ${unlocked} de ${total} ativas.`}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <StageCard profile={profile} />
        {hydrated && <HumanEvolutionMap profile={profile} />}
      </div>

      <div className="mt-10">
        <SkillTree profile={profile} onUnlock={unlock} />
      </div>
    </div>
  );
}