import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCourses } from "@/lib/courses.functions";
import { studioMe } from "@/lib/studio.functions";
import { useProgress } from "@/lib/use-progress";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Brain,
  Compass,
  Flame,
  GraduationCap,
  PenTool,
  ShoppingBag,
  Trophy,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Meu campus — Doutiva" },
      {
        name: "description",
        content:
          "Caso do Dia, aulas, Professores de IA, créditos e ranking — o circuito Doutiva em um só lugar.",
      },
      { property: "og:title", content: "Meu campus — Doutiva" },
      {
        property: "og:description",
        content: "Seu painel clínico: estudar, treinar, acumular e resgatar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const progress = useProgress();
  const fetchCourses = useServerFn(listCourses);
  const { data: me } = useQuery({
    queryKey: ["studio-me"],
    queryFn: () => studioMe(),
    staleTime: 60_000,
  });
  const {
    data: courses,
    isLoading: coursesLoading,
    isError: coursesError,
    error: coursesErr,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
    retry: 1,
  });
  const faculty = !!me?.isAdmin;
  const featured = (courses ?? []).slice(0, 3);

  return (
    <div className="relative mx-auto max-w-6xl px-6 py-10 pb-28 md:pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(197,160,89,0.12),_transparent_55%),linear-gradient(180deg,_rgba(20,24,22,0.04),_transparent)]"
      />

      <section className="overflow-hidden rounded-sm border border-border/60 bg-card/80">
        <div className="border-b border-border/50 bg-gradient-to-br from-gold/10 via-transparent to-transparent px-6 py-8 md:px-10 md:py-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {faculty ? "Painel do Mentor" : "Meu campus"}
          </span>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
            Escola do médico <span className="text-gold">do futuro</span>.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Circuito claro: Mapa → Caso do Dia → Universidade → Professores de IA.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
              <Link to="/mapa">Começar pelo Mapa</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-sm border-gold/40 text-gold hover:bg-gold/10">
              <Link to="/como-funciona">Como funciona</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Metric
              label="Meta de hoje"
              value={
                progress
                  ? `${Math.min(progress.sessionsToday, progress.dailyGoal)}/${progress.dailyGoal}`
                  : "—"
              }
              hint={progress?.goalMet ? "Sessão cumprida ✓" : "1 sessão guiada"}
            />
            <Metric
              label="XP clínico"
              value={progress ? String(progress.xp) : "—"}
              hint="Aulas + Caso do Dia"
            />
            <Metric
              label="Sequência"
              value={progress ? `${progress.streak} dias` : "—"}
              hint="Hábito diário"
            />
          </div>
        </div>

        <div className="grid gap-px bg-border/50 md:grid-cols-3">
          <Link
            to="/mapa"
            className="group flex items-start gap-4 bg-card p-6 transition hover:bg-secondary/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-sm border border-gold/40 text-gold">
              <Compass className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif text-xl">1 · Mapa clínico</h2>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-gold" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Onde você está firme e onde está o buraco.
              </p>
            </div>
          </Link>

          <Link
            to="/caso-do-dia"
            className="group flex items-start gap-4 bg-card p-6 transition hover:bg-secondary/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-sm border border-gold/40 text-gold">
              <Flame className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif text-xl">2 · Caso do Dia</h2>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-gold" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Hábito diário alinhado ao seu mapa.
              </p>
            </div>
          </Link>

          <Link
            to="/academy"
            className="group flex items-start gap-4 bg-card p-6 transition hover:bg-secondary/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-sm border border-gold/40 text-gold">
              <GraduationCap className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif text-xl">3 · Universidade</h2>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-gold" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Todas as trilhas, organizadas por área.
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl">Estudar agora</h2>
            <p className="text-sm text-muted-foreground">
              Catálogo completo na Universidade — aqui um atalho.
            </p>
          </div>
          <Link to="/academy" className="text-[10px] uppercase tracking-[0.25em] text-gold">
            Ver catálogo
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {coursesLoading && featured.length === 0 && (
            <p className="text-sm text-muted-foreground md:col-span-3">Carregando cursos…</p>
          )}
          {coursesError && (
            <div className="md:col-span-3 rounded-sm border border-destructive/40 bg-card p-4 text-sm">
              <p className="text-destructive">
                Não foi possível carregar os cursos
                {coursesErr instanceof Error ? `: ${coursesErr.message}` : "."}
              </p>
              <button
                type="button"
                onClick={() => refetchCourses()}
                className="mt-2 text-[10px] uppercase tracking-[0.2em] text-gold"
              >
                Tentar de novo
              </button>
            </div>
          )}
          {!coursesLoading && !coursesError && featured.length === 0 && (
            <p className="text-sm text-muted-foreground md:col-span-3">
              Nenhum curso publicado ainda.{" "}
              <Link to="/academy" className="text-gold">
                Abrir Universidade
              </Link>
            </p>
          )}
          {featured.map((c) => (
            <Link
              key={c.id}
              to="/academy/$slug"
              params={{ slug: c.slug }}
              className="group rounded-sm border border-border/60 bg-card p-5 transition hover:border-gold/40"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-sm border border-border/60 text-gold">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-gold" />
              </div>
              <h3 className="mt-4 font-serif text-lg leading-snug">{c.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                {c.instructor_name || "Corpo docente Doutiva"}
                {c.duration_minutes ? ` · ${c.duration_minutes} min` : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Action
          to="/professores"
          icon={Brain}
          title="Professores de IA"
          desc="Sabatina quando quiser cravar um tema."
        />
        <Action
          to="/revisao"
          icon={BookOpen}
          title="Revisão"
          desc="O que você errou volta com espaçamento."
        />
        {faculty ? (
          <Action
            to="/editor"
            icon={PenTool}
            title="Estúdio"
            desc="Gere aulas ancoradas na biblioteca científica."
          />
        ) : (
          <Action
            to="/billing"
            icon={ShoppingBag}
            title="Meu plano"
            desc="O que é livre e o que abre com Protocolos."
          />
        )}
      </section>

      {faculty && (
        <section className="mt-10 rounded-sm border border-sage/30 bg-gradient-to-br from-sage/10 to-transparent p-6 md:p-8">
          <span className="text-[10px] uppercase tracking-[0.3em] text-sage">Corpo docente</span>
          <h2 className="mt-2 font-serif text-2xl">Produza a próxima aula com evidência.</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Busque PubMed/ClinicalTrials, importe fontes, gere monografia + slides + caso com
            auditoria de IA e publique só após revisão humana.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="rounded-sm bg-sage text-primary-foreground hover:bg-sage/90">
              <Link to="/editor">Abrir Estúdio</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-sm border-sage/40">
              <Link to="/editor/biblioteca">Biblioteca Científica</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-sm border border-border/60 bg-background/70 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-2xl text-gold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function Action({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: typeof Flame;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to as "/dashboard"}
      className="group rounded-sm border border-border/60 bg-card p-5 transition hover:border-gold/40"
    >
      <Icon className="h-4 w-4 text-gold" />
      <div className="mt-3 flex items-center justify-between gap-2">
        <h3 className="font-serif text-lg">{title}</h3>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-gold" />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </Link>
  );
}

function SoonCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Em breve</span>
      <h3 className="mt-3 font-serif text-lg">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        className="rounded-sm border border-dashed border-border/70 bg-card/50 p-5 transition hover:border-gold/30"
      >
        {inner}
      </a>
    );
  }
  return (
    <div className="rounded-sm border border-dashed border-border/70 bg-card/50 p-5">{inner}</div>
  );
}
