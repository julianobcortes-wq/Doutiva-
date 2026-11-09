import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { studioMe } from "@/lib/studio.functions";
import { getMyStudyTrail } from "@/lib/brain/brain.functions";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Compass,
  Flame,
  GraduationCap,
  PenTool,
  Route as RouteIcon,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Início — Doutiva" },
      {
        name: "description",
        content: "Seu próximo passo na Doutiva — Mapa, Minha Trilha ou Caso do Dia.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const fetchTrail = useServerFn(getMyStudyTrail);
  const { data: me } = useQuery({
    queryKey: ["studio-me"],
    queryFn: () => studioMe(),
    staleTime: 60_000,
  });
  const { data: trail, isLoading } = useQuery({
    queryKey: ["study-trail"],
    queryFn: () => fetchTrail(),
    retry: 1,
  });
  const faculty = !!me?.isAdmin;
  const mapReady = !!trail?.mapReady;
  const next = (trail?.steps ?? []).find((s) => s.course) ?? null;

  return (
    <div className="relative mx-auto max-w-3xl px-6 py-14 pb-28 md:py-20 md:pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[360px] bg-[radial-gradient(ellipse_at_top,_rgba(197,160,89,0.10),_transparent_60%)]"
      />

      {faculty && (
        <p className="mb-8 text-[10px] uppercase tracking-[0.28em] text-sage">Painel do Mentor</p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Preparando seu início…</p>
      ) : !mapReady ? (
        <StartFresh />
      ) : next ? (
        <ContinueTrail
          title={next.course!.title}
          reason={next.reason}
          slug={next.course!.slug}
          locked={next.course!.access !== "full"}
        />
      ) : (
        <MapReadyEmpty />
      )}

      {faculty && (
        <section className="mt-16 border-t border-border/50 pt-10">
          <h2 className="font-serif text-2xl">Estúdio</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Produza a próxima aula com evidência.
          </p>
          <Button asChild className="mt-5 rounded-sm bg-sage text-primary-foreground hover:bg-sage/90">
            <Link to="/editor">
              <PenTool className="mr-2 h-3.5 w-3.5" /> Abrir Estúdio
            </Link>
          </Button>
        </section>
      )}
    </div>
  );
}

/** First visit — one job. */
function StartFresh() {
  return (
    <section>
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Comece aqui</p>
      <h1 className="mt-4 font-serif text-4xl leading-[1.15] tracking-tight md:text-5xl">
        Monte seu mapa.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        Uma conversa curta com a IA. Em seguida, aparece a sua trilha — o que estudar, na ordem
        certa. O resto fica quieto até você precisar.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          asChild
          size="lg"
          className="rounded-sm bg-gold px-6 text-primary-foreground hover:bg-gold-soft"
        >
          <Link to="/mapa">
            <Compass className="mr-2 h-4 w-4" /> Montar meu mapa
          </Link>
        </Button>
        <Link
          to="/como-funciona"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Como funciona
        </Link>
      </div>

      <QuietLinks />
    </section>
  );
}

/** Map done — one next study action. */
function ContinueTrail({
  title,
  reason,
  slug,
  locked,
}: {
  title: string;
  reason: string;
  slug: string;
  locked: boolean;
}) {
  return (
    <section>
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Próximo passo</p>
      <h1 className="mt-4 font-serif text-4xl leading-[1.15] tracking-tight md:text-5xl">
        Continue sua trilha.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">{reason}</p>

      <Link
        to="/academy/$slug"
        params={{ slug }}
        className="group mt-8 block rounded-sm border border-border/60 bg-card/80 p-6 transition hover:border-gold/40"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Minha Trilha · 01
            </p>
            <h2 className="mt-2 font-serif text-2xl leading-snug">{title}</h2>
            {locked && (
              <p className="mt-2 text-xs text-muted-foreground">Disponível em Protocolos — você pode ver o conteúdo.</p>
            )}
          </div>
          <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-gold transition group-hover:translate-x-0.5" />
        </div>
      </Link>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link to="/trilha" className="text-gold hover:underline">
          Ver Minha Trilha
        </Link>
        <Link to="/caso-do-dia" className="text-muted-foreground hover:text-foreground">
          Caso do Dia
        </Link>
        <Link to="/academy" className="text-muted-foreground hover:text-foreground">
          Universidade
        </Link>
      </div>
    </section>
  );
}

/** Map ready but trail empty / no course match. */
function MapReadyEmpty() {
  return (
    <section>
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Mapa pronto</p>
      <h1 className="mt-4 font-serif text-4xl leading-[1.15] tracking-tight md:text-5xl">
        Sua trilha está a um passo.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        Abra Minha Trilha para ver a fila do buraco — ou explore todos os cursos na Universidade.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          asChild
          size="lg"
          className="rounded-sm bg-gold px-6 text-primary-foreground hover:bg-gold-soft"
        >
          <Link to="/trilha">
            <RouteIcon className="mr-2 h-4 w-4" /> Abrir Minha Trilha
          </Link>
        </Button>
        <Link
          to="/academy"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Ver Universidade
        </Link>
      </div>
      <QuietLinks />
    </section>
  );
}

function QuietLinks() {
  return (
    <ul className="mt-16 space-y-4 border-t border-border/40 pt-10">
      <QuietLink
        to="/caso-do-dia"
        icon={Flame}
        label="Caso do Dia"
        hint="Três minutos, todo dia."
      />
      <QuietLink
        to="/academy"
        icon={GraduationCap}
        label="Universidade"
        hint="Todos os cursos, por área."
      />
    </ul>
  );
}

function QuietLink({
  to,
  icon: Icon,
  label,
  hint,
}: {
  to: "/caso-do-dia" | "/academy";
  icon: typeof Flame;
  label: string;
  hint: string;
}) {
  return (
    <li>
      <Link
        to={to}
        className="group flex items-center justify-between gap-4 py-1 text-foreground transition"
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-muted-foreground transition group-hover:text-gold" />
          <span>
            <span className="block font-serif text-lg">{label}</span>
            <span className="block text-xs text-muted-foreground">{hint}</span>
          </span>
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition group-hover:text-gold" />
      </Link>
    </li>
  );
}
