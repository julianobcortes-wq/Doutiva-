import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getCourseBySlug, enrollInCourse, toggleLessonComplete } from "@/lib/courses.functions";
import { courseCoverSrc } from "@/lib/course-cover";
import { LessonMarkdown } from "@/components/lesson-markdown";
import { LessonPlayer } from "@/components/lesson-player";
import { resolveRich } from "@/content/lesson-normalize";
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Clock, FlaskConical, ListTree, Lock } from "lucide-react";
import { toast } from "sonner";
import { refreshProgress } from "@/lib/use-progress";

const courseQuery = (slug: string) => ({
  queryKey: ["course", slug],
  queryFn: () => getCourseBySlug({ data: { slug } }),
});

export const Route = createFileRoute("/_authenticated/academy/$slug")({
  head: () => ({
    meta: [
      { title: "Curso — Universidade Doutiva" },
      { name: "description", content: "Sessão guiada com lâminas, pontos-chave, caso clínico e revisão espaçada." },
    ],
  }),
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(courseQuery(params.slug));
    if (!data) throw notFound();
  },
  component: CoursePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="text-4xl font-light">Curso não encontrado</h1>
      <Button asChild className="mt-6 bg-gold text-primary-foreground hover:bg-gold-soft rounded-sm">
        <Link to="/academy">Voltar ao catálogo</Link>
      </Button>
    </div>
  ),
});

type Ref = { citation: string; url?: string };

function CoursePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(courseQuery(slug));
  const course = data!;
  const qc = useQueryClient();
  const router = useRouter();
  const enrollFn = useServerFn(enrollInCourse);
  const toggleFn = useServerFn(toggleLessonComplete);
  const [activeId, setActiveId] = useState<string | null>(course.lessons[0]?.id ?? null);
  const [menuOpen, setMenuOpen] = useState(false);

  const locked = course.access === "locked";
  const autoEnrolled = useRef(false);

  const enrollMut = useMutation({
    mutationFn: enrollFn,
    onSuccess: () => {
      toast.success("Matrícula confirmada");
      qc.invalidateQueries({ queryKey: ["course", slug] });
      router.invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível matricular"),
  });

  // Auto-enroll when the student opens an unlocked course — progress/certificates depend on it.
  useEffect(() => {
    if (locked || course.enrolled || autoEnrolled.current || enrollMut.isPending) return;
    autoEnrolled.current = true;
    enrollMut.mutate({ data: { courseId: course.id } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, course.enrolled, course.id]);
  const toggleMut = useMutation({
    mutationFn: toggleFn,
    onSuccess: (r) => {
      if (r.awarded) {
        toast.success("+30 XP · +2 Créditos");
        refreshProgress();
      }
      qc.invalidateQueries({ queryKey: ["course", slug] });
    },
  });

  const modules = useMemo(() => {
    const map = new Map<string, typeof course.lessons>();
    for (const l of course.lessons) {
      const k = l.module_title ?? "Aulas";
      map.set(k, [...(map.get(k) ?? []), l]);
    }
    return [...map.entries()];
  }, [course.lessons]);

  const idx = Math.max(0, course.lessons.findIndex((l) => l.id === activeId));
  const lesson = course.lessons[idx];
  const done = course.progress.length;
  const total = course.lessons.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const refs = (lesson?.refs as Ref[] | null) ?? [];
  const rich = lesson ? resolveRich(lesson, course.slug) : null;
  const cover = courseCoverSrc(course.cover_url as string | null, course.slug as string);

  const select = (id: string) => {
    setActiveId(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const go = (i: number) => {
    const l = course.lessons[i];
    if (l) select(l.id);
  };

  const syllabus = (
    <div className="space-y-5">
      {modules.map(([title, ls]) => (
        <div key={title}>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gold">{title}</div>
          <ul className="mt-2 space-y-1">
            {ls.map((l) => {
              const isDone = course.progress.includes(l.id);
              const active = l.id === lesson?.id;
              return (
                <li key={l.id}>
                  <button
                    onClick={() => select(l.id)}
                    className={`flex w-full items-start gap-2 rounded-sm px-2 py-2 text-left text-sm transition ${
                      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 opacity-40" />
                    )}
                    <span className="font-light leading-snug">{l.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pb-24">
      {cover && (
        <div className="relative h-52 overflow-hidden border-b border-border/60 md:h-72">
          <img src={cover} alt="" className="h-full w-full object-cover object-center" />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent"
          />
        </div>
      )}
      <div className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-6 md:py-12">
          <Link
            to="/academy"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Universidade Doutiva
          </Link>
          <div className="mt-6 grid gap-8 md:grid-cols-[1.6fr_1fr] md:items-end">
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold">{course.category}</span>
              <h1 className="mt-3 text-balance font-display text-3xl font-medium leading-tight tracking-tight md:text-5xl">
                {course.title}
              </h1>
              <p className="mt-3 text-base font-light text-muted-foreground md:text-lg">{course.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                <span>{course.level}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {Math.round(course.duration_minutes / 60)}h
                </span>
                <span>
                  {modules.length} módulos · {total} aulas
                </span>
                {course.free && <span className="text-gold">Acesso livre</span>}
                {locked && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Lock className="h-3 w-3" /> Protocolos
                  </span>
                )}
                {!locked && rich && <span className="text-gold">Sessão guiada · Aprofundar</span>}
              </div>
            </div>
            <div className="rounded-sm border border-border/60 bg-card p-6">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Corpo docente</div>
              <div className="mt-2 text-lg font-light">{course.instructor_name}</div>
              <div className="text-xs text-muted-foreground">{course.instructor_title}</div>
              {locked ? (
                <div className="mt-5 space-y-3">
                  <p className="text-sm font-light text-muted-foreground">
                    Esta trilha faz parte de Protocolos.
                  </p>
                  <Button asChild className="h-11 w-full rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
                    <Link to="/billing">Assinar Protocolos · R$ 297</Link>
                  </Button>
                </div>
              ) : course.enrolled ? (
                <div className="mt-5">
                  <div className="flex justify-between text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    <span>Progresso</span>
                    <span className="text-gold">
                      {done}/{total} · {pct}%
                    </span>
                  </div>
                  <Progress value={pct} className="mt-2 h-1 bg-secondary [&>div]:bg-gold" />
                </div>
              ) : (
                <p className="mt-5 text-xs text-muted-foreground">
                  {enrollMut.isPending ? "Confirmando matrícula…" : "Matrícula automática ao abrir a trilha."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:px-6 md:py-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
          <h3 className="mb-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Ementa</h3>
          {syllabus}
        </aside>

        {locked && (
          <article className="min-w-0">
            <div className="relative overflow-hidden rounded-sm border border-gold/25 bg-gradient-to-br from-gold/10 via-card to-card p-10 md:p-14">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
              <div className="relative mx-auto max-w-lg text-center">
                <Lock className="mx-auto h-8 w-8 text-gold" />
                <h2 className="mt-6 font-display text-3xl tracking-tight">Conteúdo em Protocolos</h2>
                <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground">
                  A ementa está visível. Sessões, lâminas e casos abrem com a assinatura. Peptídeos,
                  Manipulados, Hormônios, Soroterapia e Negócios permanecem livres na Universidade.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button asChild className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
                    <Link to="/billing">Assinar Protocolos</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-sm">
                    <Link to="/academy/$slug" params={{ slug: "peptideos-medicina-de-precisao" }}>
                      Ir para Peptídeos
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </article>
        )}

        {!locked && lesson && (
          <article className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {lesson.module_title} · Aula {idx + 1}/{total}
              </div>
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-sm border-border/60 text-[10px] uppercase tracking-[0.2em] lg:hidden"
                  >
                    <ListTree className="mr-1 h-3.5 w-3.5" /> Ementa
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="font-light">Ementa</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">{syllabus}</div>
                </SheetContent>
              </Sheet>
            </div>
            <h2 className="mt-3 max-w-3xl text-balance font-display text-2xl font-medium leading-snug tracking-tight md:text-3xl">
              {lesson.title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
              {lesson.evidence_level && (
                <span className="inline-flex items-center gap-1 border border-gold/40 px-3 py-1 text-gold">
                  <FlaskConical className="h-3 w-3" /> {lesson.evidence_level}
                </span>
              )}
              <span className="inline-flex items-center gap-1 border border-border px-3 py-1 text-muted-foreground">
                <Clock className="h-3 w-3" /> {lesson.duration_minutes} min
              </span>
              {lesson.reviewed_by && (
                <span className="normal-case tracking-normal text-[11px] text-muted-foreground">
                  Revisado · {lesson.reviewed_by}
                  {lesson.reviewed_at
                    ? ` · ${new Date(lesson.reviewed_at).toLocaleDateString("pt-BR")}`
                    : ""}
                </span>
              )}
            </div>

            {rich ? (
              <LessonPlayer
                key={lesson.id}
                lessonId={lesson.id}
                lessonTitle={lesson.title}
                evidenceLevel={lesson.evidence_level}
                durationMinutes={lesson.duration_minutes}
                keyPoints={lesson.key_points}
                refs={refs}
                rich={rich}
                hasMonograph={!!(lesson as { has_monograph?: boolean }).has_monograph}
                enrolled={!!course.enrolled}
                alreadyDone={course.progress.includes(lesson.id)}
                onComplete={() => toggleMut.mutate({ data: { lessonId: lesson.id } })}
                hasNextLesson={idx < total - 1}
                onNextLesson={() => go(idx + 1)}
              />
            ) : (
              <>
                {lesson.description && (
                  <p className="mt-4 max-w-2xl text-sm font-light text-muted-foreground">
                    {lesson.description}
                  </p>
                )}
                <LegacyLesson points={lesson.key_points} content={lesson.content} refs={refs} />
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <Button variant="ghost" disabled={idx === 0} onClick={() => go(idx - 1)} className="rounded-sm">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                  </Button>
                  {course.enrolled && (
                    <Button
                      variant="outline"
                      onClick={() => toggleMut.mutate({ data: { lessonId: lesson.id } })}
                      className="rounded-sm border-gold/40"
                    >
                      {course.progress.includes(lesson.id) ? "Concluída ✓" : "Marcar como concluída"}
                    </Button>
                  )}
                  <Button variant="ghost" disabled={idx === total - 1} onClick={() => go(idx + 1)} className="rounded-sm">
                    Próxima
                  </Button>
                </div>
              </>
            )}

            <p className="mt-10 text-[11px] leading-relaxed text-muted-foreground/80">
              Conteúdo educacional para médicos. Não substitui bula, diretrizes vigentes nem o julgamento clínico
              individualizado.
            </p>
          </article>
        )}
      </div>
    </div>
  );
}

function LegacyLesson({
  points,
  content,
  refs,
}: {
  points: string[] | null | undefined;
  content: string | null | undefined;
  refs: Ref[];
}) {
  return (
    <>
      {!!points?.length && (
        <div className="mt-6 rounded-sm border border-gold/30 bg-gold/5 p-5">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Pontos-chave</div>
          <ul className="mt-3 space-y-2">
            {points.map((k) => (
              <li key={k} className="flex gap-2 text-sm font-light">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                {k}
              </li>
            ))}
          </ul>
        </div>
      )}
      {content && (
        <div className="mt-6">
          <LessonMarkdown>{content}</LessonMarkdown>
        </div>
      )}
      {!!refs.length && (
        <section className="mt-10 border-t border-border/60 pt-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <BookOpen className="h-3 w-3" /> Referências primárias
          </div>
          <ol className="mt-4 space-y-2 text-xs text-muted-foreground">
            {refs.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-gold">{i + 1}.</span>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer" className="hover:text-foreground hover:underline">
                    {r.citation}
                  </a>
                ) : (
                  r.citation
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
