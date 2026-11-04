import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, GraduationCap, Users, CalendarDays, Wrench, Rocket } from "lucide-react";
import { useValleyProfile } from "@/lib/use-city-profile";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [{ title: "Biblioteca — Doutiva" }] }),
  component: LibraryPage,
});

const tabs = [
  { id: "all", label: "Tudo" },
  { id: "academy", label: "Academy" },
  { id: "mentors", label: "Mentors" },
  { id: "events", label: "Events" },
  { id: "tools", label: "Tools" },
  { id: "ventures", label: "Ventures" },
] as const;

const items = [
  { kind: "academy", icon: GraduationCap, title: "Médico-CEO · Fundamentos", subtitle: "Trilha · 8 módulos", to: "/academy" },
  { kind: "mentors", icon: Users, title: "Dra. Helena Vasconcellos", subtitle: "M&A em Saúde", to: "/mentors" },
  { kind: "events", icon: CalendarDays, title: "Mesa SP · Maio", subtitle: "Presencial · Fasano JK", to: "/events" },
] as const;

function LibraryPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("all");
  const { profile, hydrated } = useValleyProfile();
  const expert = hydrated && profile.user_class === "valley_expert";
  const filtered = tab === "all" ? items : items.filter((i) => i.kind === tab);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 pb-24 md:pb-12">
      <header className="border-b border-border/60 pb-8">
        <span className={`text-[10px] uppercase tracking-[0.3em] ${expert ? "text-sage" : "text-gold"}`}>
          {expert ? "Meus conteúdos" : "Biblioteca"}
        </span>
        <h1 className="mt-2 font-serif text-4xl">{expert ? "O que você publicou e guardou" : "Seus salvos"}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {expert
            ? "Materiais, trilhas e referências que sustentam a sua atuação dentro da Doutiva."
            : "Tudo o que você marcou para revisitar — cursos, mentores, eventos, ferramentas e ventures."}
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-sm border px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition ${
              tab === t.id ? "border-gold text-gold bg-gold/10" : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {filtered.map((i, idx) => (
          <li key={idx}>
            <Link
              to={i.to}
              className="flex items-start gap-4 rounded-sm border border-border/60 bg-card p-5 transition hover:border-gold/40"
            >
              <span className="grid h-10 w-10 place-items-center rounded-sm border border-gold/30 text-gold">
                <i.icon className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="font-serif text-lg">{i.title}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{i.subtitle}</div>
              </div>
              <Bookmark className="h-4 w-4 text-gold" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}