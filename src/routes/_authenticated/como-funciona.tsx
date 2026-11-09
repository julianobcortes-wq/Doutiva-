import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Compass,
  Flame,
  GraduationCap,
  ListOrdered,
  Route as RouteIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como funciona — Doutiva" },
      {
        name: "description",
        content:
          "Passo a passo da Doutiva: Mapa clínico, Minha Trilha, Caso do Dia, Universidade e Professores de IA.",
      },
    ],
  }),
  component: ComoFuncionaPage,
});

const STEPS = [
  {
    n: "01",
    title: "Faça o Mapa clínico",
    body: "Uma entrevista curta com a IA. O resultado é verde / amarelo / vermelho por tema — o cérebro sabe onde você está firme e onde está o buraco.",
    to: "/mapa" as const,
    cta: "Abrir Mapa",
    icon: Compass,
  },
  {
    n: "02",
    title: "Siga Minha Trilha",
    body: "Do mapa sai a fila pessoal: o que estudar agora, na ordem do buraco. Marcada, separada do catálogo genérico.",
    to: "/trilha" as const,
    cta: "Minha Trilha",
    icon: RouteIcon,
  },
  {
    n: "03",
    title: "Treine no Caso do Dia",
    body: "Todo dia, um caso clínico alinhado ao seu mapa. Três minutos. Errou? Vai para a Revisão espaçada.",
    to: "/caso-do-dia" as const,
    cta: "Caso de hoje",
    icon: Flame,
  },
  {
    n: "04",
    title: "Explore a Universidade",
    body: "Todos os cursos que criamos — monografia, slides e caso — organizados por área. Nada cortado; a trilha só prioriza.",
    to: "/academy" as const,
    cta: "Ver cursos",
    icon: GraduationCap,
  },
  {
    n: "05",
    title: "Aprofunde com Professores de IA",
    body: "Sabatina socrática quando quiser cravar um tema. Índice de domínio sobe com o que você demonstra — não com tempo de tela.",
    to: "/professores" as const,
    cta: "Professores",
    icon: Brain,
  },
];

function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 pb-28 md:pb-12">
      <header className="border-b border-border/60 pb-8">
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
          <ListOrdered className="h-3.5 w-3.5" /> Primeira vez aqui
        </span>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Como a Doutiva funciona</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Entrevista → Minha Trilha → estudo. A Universidade guarda o catálogo inteiro. O resto da
          navegação apoia esse circuito.
        </p>
      </header>

      <ol className="mt-10 space-y-4">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <li
              key={s.n}
              className="rounded-sm border border-border/60 bg-card p-5 md:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <span className="font-serif text-2xl text-gold/80">{s.n}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gold" />
                      <h2 className="font-serif text-xl">{s.title}</h2>
                    </div>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">{s.body}</p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="shrink-0 rounded-sm border-gold/40 text-gold hover:bg-gold/10"
                >
                  <Link to={s.to}>
                    {s.cta} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="mt-10 rounded-sm border border-border/60 bg-card/80 p-6">
        <h2 className="font-serif text-xl">O que é livre vs Protocolos</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Livre:</strong> Peptídeos, Incretinas/Emagrecimento,
            Hormônios, Manipulados, Soroterapia e Negócios (e outras trilhas liberadas no
            lançamento).
          </li>
          <li>
            <strong className="text-foreground">Protocolos:</strong> abre o restante da clínica e
            intensifica Professores de IA.
          </li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
            <Link to="/mapa">Começar pelo Mapa</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-sm text-muted-foreground">
            <Link to="/billing">Ver meu plano</Link>
          </Button>
        </div>
      </section>

      <p className="mt-8 flex items-start gap-2 text-xs text-muted-foreground">
        <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
        Este guia fica sempre em <span className="text-foreground">Como funciona</span> na barra
        lateral — e no mobile como <span className="text-foreground">Guia</span>.
      </p>
    </div>
  );
}
