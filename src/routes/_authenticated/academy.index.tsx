import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listCourses } from "@/lib/courses.functions";
import { ArrowUpRight, Clock, Lock } from "lucide-react";
import { useValleyProfile } from "@/lib/use-city-profile";

const coursesQuery = {
  queryKey: ["courses"],
  queryFn: () => listCourses(),
};

export const Route = createFileRoute("/_authenticated/academy/")({
  head: () => ({ meta: [{ title: "Universidade Doutiva — Doutiva" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(coursesQuery),
  component: AcademyPage,
});

function AcademyPage() {
  const { data } = useSuspenseQuery(coursesQuery);
  const { profile, hydrated } = useValleyProfile();
  const expert = hydrated && profile.user_class === "valley_expert";
  const courses = data ?? [];
  const featured = courses.filter((c) => c.featured);
  const rest = courses.filter((c) => !c.featured);
  const subscribed = courses.some((c) => c.subscribed);

  return (
    <div>
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <span className={`text-[10px] uppercase tracking-[0.3em] ${expert ? "text-sage" : "text-gold"}`}>
            {expert ? "Ensinar na Universidade" : "Universidade Doutiva"}
          </span>
          <h1 className="mt-3 font-display text-5xl tracking-tight md:text-6xl">
            {expert ? "Transforme seu método em trilha." : "Medicina de fronteira, com evidência."}
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {expert
              ? "Veja as trilhas que já existem, entenda o padrão da Doutiva e proponha a sua própria formação."
              : subscribed
                ? "AI-first: após o Mapa clínico, a ordem das aulas prioriza as suas lacunas."
                : "Peptídeos liberados na sua conta. Demais trilhas abrem com Protocolos."}
          </p>
          {!subscribed && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-sm border border-gold/30 bg-gold/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-gold">
              Trilha Peptídeos · acesso livre
            </p>
          )}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Em destaque</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featured.map((c) => (
              <CourseCard key={c.id} course={c} large />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Catálogo completo</h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 md:grid-cols-2">
          {rest.map((c) => {
            const locked = c.access === "locked";
            return (
              <Link
                key={c.id}
                to="/academy/$slug"
                params={{ slug: c.slug }}
                className="group flex items-start justify-between gap-6 bg-background p-8 transition hover:bg-card"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold">{c.category}</span>
                    {c.free ? (
                      <span className="rounded-sm border border-gold/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-gold">
                        Livre
                      </span>
                    ) : locked ? (
                      <span className="inline-flex items-center gap-1 rounded-sm border border-border/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                        <Lock className="h-2.5 w-2.5" /> Protocolos
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 font-display text-2xl tracking-tight">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.subtitle}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>{c.level}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {Math.round(c.duration_minutes / 60)}h
                    </span>
                  </div>
                </div>
                {locked ? (
                  <Lock className="h-5 w-5 shrink-0 text-muted-foreground/60" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:text-gold" />
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function CourseCard({
  course,
  large,
}: {
  course: Awaited<ReturnType<typeof listCourses>>[number];
  large?: boolean;
}) {
  const locked = course.access === "locked";
  return (
    <Link
      to="/academy/$slug"
      params={{ slug: course.slug }}
      className="group relative flex flex-col overflow-hidden rounded-sm border border-border/60 bg-card transition hover:border-gold/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-neutral-900 via-black to-neutral-900">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.82_0.13_205/0.2),transparent_55%)]"
        />
        <div className="absolute inset-0 flex items-end p-6">
          <span className="font-display text-6xl leading-none text-gold/25">{course.title.charAt(0)}</span>
        </div>
        <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
          <span className="rounded-sm border border-gold/30 bg-background/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold backdrop-blur">
            {course.category}
          </span>
          {course.free ? (
            <span className="rounded-sm border border-gold/40 bg-gold/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-gold">
              Livre
            </span>
          ) : locked ? (
            <span className="inline-flex items-center gap-1 rounded-sm border border-border/70 bg-background/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
              <Lock className="h-2.5 w-2.5" /> Protocolos
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className={`font-display tracking-tight ${large ? "text-2xl" : "text-xl"}`}>{course.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{course.subtitle}</p>
        <div className="mt-auto flex items-center justify-between pt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>{course.instructor_name}</span>
          <span className="flex items-center gap-1 text-gold opacity-0 transition group-hover:opacity-100">
            {locked ? "Ver trilha" : "Acessar"} <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
