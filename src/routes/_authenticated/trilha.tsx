import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Compass, GraduationCap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMyStudyTrail } from "@/lib/brain/brain.functions";
import type { StudyTrailStep } from "@/lib/brain/types";

export const Route = createFileRoute("/_authenticated/trilha")({
  head: () => ({
    meta: [
      { title: "Minha Trilha — Doutiva" },
      {
        name: "description",
        content: "Sua fila de estudo pessoal, montada a partir do Mapa clínico.",
      },
    ],
  }),
  component: TrilhaPage,
});

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
    <div className="mx-auto max-w-2xl px-6 py-14 pb-28 md:py-20 md:pb-16">
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Minha Trilha</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">O que estudar agora</h1>

      {loading && (
        <p className="mt-8 text-sm text-muted-foreground">Montando sua trilha…</p>
      )}

      {trailQuery.isError && (
        <div className="mt-10">
          <p className="text-sm text-muted-foreground">
            Não foi possível montar a trilha. Comece pelo Mapa.
          </p>
          <Button asChild className="mt-5 rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
            <Link to="/mapa">Abrir Mapa</Link>
          </Button>
        </div>
      )}

      {!loading && !trailQuery.isError && trail && !trail.mapReady && (
        <section className="mt-8">
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Ainda sem mapa. São 8 perguntas (~10 min) — depois a fila pessoal aparece aqui.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft"
          >
            <Link to="/mapa">
              <Compass className="mr-2 h-4 w-4" /> Montar meu mapa · 8 perguntas
            </Link>
          </Button>
          <p className="mt-6 text-sm text-muted-foreground">
            Enquanto isso, o catálogo completo está na{" "}
            <Link to="/academy" className="text-gold hover:underline">
              Universidade
            </Link>
            .
          </p>
        </section>
      )}

      {!loading && !trailQuery.isError && trail?.mapReady && (
        <>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Ordem do seu mapa — lacunas primeiro. O catálogo inteiro continua na Universidade.
          </p>

          <ol className="mt-12 space-y-0">
            {trail.steps.map((step, i) => (
              <li key={`${step.topic.id}-${step.rank}`}>
                <TrailRow step={step} last={i === trail.steps.length - 1} />
              </li>
            ))}
            {trail.steps.length === 0 && (
              <li className="py-6 text-sm text-muted-foreground">
                Mapa pronto, sem fila ainda.{" "}
                <Link to="/mapa" className="text-gold hover:underline">
                  Recalibrar
                </Link>{" "}
                ou{" "}
                <Link to="/academy" className="text-gold hover:underline">
                  abrir a Universidade
                </Link>
                .
              </li>
            )}
          </ol>

          <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to="/mapa" className="text-muted-foreground hover:text-foreground">
              Recalibrar mapa
            </Link>
            <Link to="/academy" className="inline-flex items-center gap-1 text-gold hover:underline">
              <GraduationCap className="h-3.5 w-3.5" /> Universidade
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function TrailRow({ step, last }: { step: StudyTrailStep; last: boolean }) {
  const locked = step.course?.access !== "full";
  const href = step.course?.slug;

  const inner = (
    <>
      <span className="w-8 shrink-0 font-serif text-xl text-gold/60">
        {String(step.rank).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {BAND_LABEL[step.band]}
          {step.topic.specialty ? ` · ${step.topic.specialty}` : ""}
        </span>
        <span className="mt-1 block font-serif text-xl leading-snug">
          {step.course?.title ?? step.topic.title}
        </span>
        {!step.course && (
          <span className="mt-1 block text-xs text-muted-foreground">
            Tema no mapa — ainda sem curso ligado.
          </span>
        )}
      </span>
      <span className="shrink-0 text-muted-foreground">
        {locked ? <Lock className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
      </span>
    </>
  );

  return (
    <div className={last ? "py-5" : "border-b border-border/40 py-5"}>
      {href ? (
        <Link
          to="/academy/$slug"
          params={{ slug: href }}
          className="group flex items-start gap-4 transition hover:opacity-90"
        >
          {inner}
        </Link>
      ) : (
        <div className="flex items-start gap-4">{inner}</div>
      )}
    </div>
  );
}
