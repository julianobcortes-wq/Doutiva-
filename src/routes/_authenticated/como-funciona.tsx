import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Flame, GraduationCap, ListOrdered, Route as RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como funciona — Doutiva" },
      {
        name: "description",
        content: "Três passos: Mapa, Minha Trilha, Universidade.",
      },
    ],
  }),
  component: ComoFuncionaPage,
});

const STEPS = [
  {
    n: "1",
    title: "Mapa",
    body: "8 perguntas (~10 min). A IA vê onde você está firme e onde está o buraco — e monta a trilha.",
    to: "/mapa" as const,
    cta: "Montar mapa",
    icon: Compass,
  },
  {
    n: "2",
    title: "Minha Trilha",
    body: "Do mapa sai a sua fila — o que estudar agora, na ordem certa.",
    to: "/trilha" as const,
    cta: "Ver trilha",
    icon: RouteIcon,
  },
  {
    n: "3",
    title: "Universidade",
    body: "Todos os cursos, organizados. A trilha prioriza; o catálogo não some.",
    to: "/academy" as const,
    cta: "Ver cursos",
    icon: GraduationCap,
  },
];

function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14 pb-28 md:py-20 md:pb-16">
      <header>
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          <ListOrdered className="h-3.5 w-3.5" /> Como funciona
        </span>
        <h1 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">Três passos.</h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          Sem painel lotado. Você monta o mapa, segue a trilha e estuda. O Caso do Dia e os
          Professores entram quando você quiser.
        </p>
      </header>

      <ol className="mt-12 space-y-8">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.n} className="flex gap-5">
              <span className="font-serif text-3xl text-gold/70">{s.n}</span>
              <div className="flex-1 border-b border-border/40 pb-8">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gold" />
                  <h2 className="font-serif text-2xl">{s.title}</h2>
                </div>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                <Link
                  to={s.to}
                  className="mt-4 inline-flex items-center gap-1 text-sm text-gold hover:underline"
                >
                  {s.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex items-start gap-3 py-2">
        <Flame className="mt-1 h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-serif text-lg">Caso do Dia</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Três minutos por dia, alinhado ao seu mapa — hábito, não obrigação.
          </p>
          <Link to="/caso-do-dia" className="mt-2 inline-flex text-sm text-muted-foreground hover:text-gold">
            Abrir caso de hoje
          </Link>
        </div>
      </div>

      <div className="mt-12">
        <Button asChild size="lg" className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
          <Link to="/mapa">Começar pelo Mapa</Link>
        </Button>
      </div>
    </div>
  );
}
