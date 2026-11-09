import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowUpRight,
  Compass,
  GraduationCap,
  Lock,
  Route as RouteIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMyStudyTrail } from "@/lib/brain/brain.functions";
import type { StudyTrailStep } from "@/lib/brain/types";

export const Route = createFileRoute("/_authenticated/trilha")({
  head: () => ({
    meta: [
      { title: "Minha Trilha — Doutiva" },
      {
        name: "description",
        content:
          "Sua fila de estudo pessoal, montada a partir do Mapa clínico. A Universidade completa fica ao lado.",
      },
    ],
  }),
  component: TrilhaPage,
});

const BAND_STYLE: Record<StudyTrailStep["band"], string> = {
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  yellow: "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  red: "border-rose-500/35 bg-rose-500/10 text-rose-800 dark:text-rose-200",
  untouched: "border-border/60 bg-muted/20 text-muted-foreground",
};

const BAND_LABEL: Record<StudyTrailStep["band"], string> = {
  green: "Domina",
  yellow: "Parcial",
  red: "Lacuna",
  untouched: "Não visto",
};

function TrilhaPage() {
  const loadTrail = useServerFn(getMyStudyTrail);
  const trailQuery = useQuery({
    queryKey: ["study-trail"],
    queryFn: () => loadTrail(),
    retry: 1,
  });

  const trail = trailQuery.data;
  const loading = trailQuery.isLoading;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6">
      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-gold">
        <RouteIcon className="h-3.5 w-3.5" /> Minha Trilha
      </div>
      <h1 className="mt-3 font-serif text-4xl font-light tracking-tight sm:text-5xl">
        O que estudar agora
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Sai do Mapa clínico — entrevista com o Cartógrafo. Aqui está a fila do buraco. O catálogo
        completo continua na Universidade.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="gap-2 rounded-sm">
          <Link to="/mapa">
            <Compass className="h-3.5 w-3.5" />
            {trail?.mapReady ? "Recalibrar mapa" : "Fazer entrevista"}
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2 rounded-sm">
          <Link to="/academy">
            <GraduationCap className="h-3.5 w-3.5" /> Ver catálogo completo
          </Link>
        </Button>
      </div>

      {loading && (
        <p className="mt-10 text-sm text-muted-foreground">Montando sua trilha a partir do mapa…</p>
      )}

      {trailQuery.isError && (
        <div className="mt-10 border border-border/60 px-5 py-6 text-sm text-muted-foreground">
          Não foi possível montar a trilha agora. Faça o Mapa clínico e tente de novo.
          <div className="mt-4">
            <Button asChild className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
              <Link to="/mapa">Abrir Mapa</Link>
            </Button>
          </div>
        </div>
      )}

      {!loading && !trailQuery.isError && trail && (
        <>
          <div className="mt-10 grid gap-3 sm:grid-cols-4">
            <Stat label="Domina" value={trail.counts.green} />
            <Stat label="Parcial" value={trail.counts.yellow} />
            <Stat label="Lacuna" value={trail.counts.red} />
            <Stat label="Catálogo" value={trail.catalogCount} />
          </div>

          {!trail.mapReady ? (
            <div className="mt-8 border border-dashed border-border/70 px-5 py-8">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-gold" />
                <div>
                  <h2 className="font-serif text-xl">Primeiro: a entrevista do Mapa</h2>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    Sem o mapa, não há trilha pessoal — só o catálogo genérico. Em ~10 minutos o
                    Cartógrafo calibra onde você está firme e onde está o buraco. Daí esta página
                    vira sua fila.
                  </p>
                  <Button
                    asChild
                    className="mt-5 rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft"
                  >
                    <Link to="/mapa">Começar entrevista</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <ol className="mt-10 space-y-3">
              {trail.steps.map((step) => (
                <li key={`${step.topic.id}-${step.rank}`}>
                  <TrailStepCard step={step} />
                </li>
              ))}
              {trail.steps.length === 0 && (
                <li className="border border-border/60 px-5 py-6 text-sm text-muted-foreground">
                  Mapa pronto, mas ainda sem fila montada. Recalibre o mapa ou abra a Universidade.
                </li>
              )}
            </ol>
          )}

          <section className="mt-12 border border-border/60 bg-card/60 px-5 py-6">
            <h2 className="font-serif text-xl">Universidade = catálogo inteiro</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Minha Trilha prioriza o buraco do mapa. Na Universidade você vê todos os cursos que
              criamos — nada cortado, organizado por área.
            </p>
            <Button asChild variant="outline" className="mt-4 rounded-sm border-gold/40 text-gold">
              <Link to="/academy">
                Abrir Universidade <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </section>
        </>
      )}
    </div>
  );
}

function TrailStepCard({ step }: { step: StudyTrailStep }) {
  const locked = step.course?.access !== "full";
  const hrefCourse = step.course?.slug;

  return (
    <div className="flex flex-col gap-4 rounded-sm border border-border/60 bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-4">
        <span className="font-serif text-2xl text-gold/80">{String(step.rank).padStart(2, "0")}</span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${BAND_STYLE[step.band]}`}
            >
              {BAND_LABEL[step.band]}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {step.topic.specialty || "tema"}
            </span>
          </div>
          <h3 className="mt-2 font-serif text-xl leading-snug">{step.topic.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{step.reason}</p>
          {step.course ? (
            <p className="mt-3 text-sm">
              <span className="text-muted-foreground">Curso: </span>
              <span className="text-foreground">{step.course.title}</span>
              {step.lesson ? (
                <span className="text-muted-foreground"> · {step.lesson.title}</span>
              ) : null}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Tema no mapa — ainda sem aula ligada. Abra a Universidade ou peça ao Estúdio.
            </p>
          )}
        </div>
      </div>

      {hrefCourse ? (
        <Button
          asChild
          variant={locked ? "outline" : "default"}
          className={
            locked
              ? "shrink-0 rounded-sm"
              : "shrink-0 rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft"
          }
        >
          <Link to="/academy/$slug" params={{ slug: hrefCourse }}>
            {locked ? (
              <>
                <Lock className="mr-1 h-3.5 w-3.5" /> Ver trilha
              </>
            ) : (
              <>
                Estudar <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </>
            )}
          </Link>
        </Button>
      ) : (
        <Button asChild variant="outline" className="shrink-0 rounded-sm">
          <Link to="/academy">Ver catálogo</Link>
        </Button>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border/60 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-3xl font-light tabular-nums">{value}</p>
    </div>
  );
}
