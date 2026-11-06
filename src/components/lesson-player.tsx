import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  Layers,
  MessageSquareText,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ClinicalSlideDeck } from "@/components/clinical-slide-deck";
import { ClinicalCaseSimulator } from "@/components/clinical-case-simulator";
import { LessonMarkdown } from "@/components/lesson-markdown";
import { QuickReferenceCard } from "@/components/quick-reference-card";
import { LessonTutor } from "@/components/lesson-tutor";
import { gradeLessonCase } from "@/lib/daily-case.functions";
import { getLessonMonograph } from "@/lib/courses.functions";
import { awardSessionBeat, type BeatAwardResult, type SessionBeat } from "@/lib/progress.functions";
import { toPublicClinicalCase, type CaseGradeResult, type PublicClinicalCase } from "@/lib/clinical-case-public";
import type { RichLesson } from "@/content/lesson-types";
import { nextReview, addDays } from "@/lib/review";
import { supabase } from "@/integrations/supabase/client";
import { refreshProgress, useProgress } from "@/lib/use-progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

type Ref = { citation: string; url?: string };

type Props = {
  lessonId: string;
  lessonTitle: string;
  evidenceLevel?: string | null;
  durationMinutes?: number | null;
  keyPoints?: string[] | null;
  refs?: Ref[];
  rich: RichLesson;
  hasMonograph?: boolean;
  enrolled: boolean;
  alreadyDone: boolean;
  onComplete: () => void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
};

type Mode = "play" | "deepen";
type Phase = "slides" | "keys" | "case" | "done";

function todaySP() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function LessonPlayer({
  lessonId,
  lessonTitle,
  evidenceLevel,
  durationMinutes,
  keyPoints,
  refs = [],
  rich,
  hasMonograph = false,
  enrolled,
  alreadyDone,
  onComplete,
  onNextLesson,
  hasNextLesson,
}: Props) {
  const hasSlides = rich.slides.length > 0;
  const hasKeys = !!keyPoints?.length;
  const hasCase = !!rich.clinicalCase?.vignette && rich.clinicalCase.options.length >= 2;
  const hasGuide = !!rich.quickRef?.trim();
  const canDeepen = hasMonograph || hasGuide;

  const phases = useMemo(() => {
    const p: Phase[] = [];
    if (hasSlides) p.push("slides");
    if (hasKeys) p.push("keys");
    if (hasCase) p.push("case");
    p.push("done");
    return p;
  }, [hasSlides, hasKeys, hasCase]);

  const [mode, setMode] = useState<Mode>("play");
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  const [revealedKeys, setRevealedKeys] = useState<Set<number>>(() => new Set());
  const [grade, setGrade] = useState<CaseGradeResult | null>(null);
  const [grading, setGrading] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [enterKey, setEnterKey] = useState(0);
  const [deepMono, setDeepMono] = useState<string>("");
  const [deepRefs, setDeepRefs] = useState<Ref[]>(refs);
  const [deepGuide, setDeepGuide] = useState(rich.quickRef || "");
  const [deepLoading, setDeepLoading] = useState(false);
  const [reviewDueDays, setReviewDueDays] = useState<number | null>(null);
  const [sessionResult, setSessionResult] = useState<BeatAwardResult | null>(null);
  const [awardedBeats, setAwardedBeats] = useState<Set<SessionBeat>>(() => new Set());

  const progress = useProgress();
  const gradeFn = useServerFn(gradeLessonCase);
  const monoFn = useServerFn(getLessonMonograph);
  const awardFn = useServerFn(awardSessionBeat);
  const publicCase: PublicClinicalCase | null = hasCase ? toPublicClinicalCase(rich.clinicalCase) : null;

  // Reset session only when the lesson changes — never on parent re-renders.
  useEffect(() => {
    setMode("play");
    setPhaseIdx(0);
    setSlideIdx(0);
    setRevealedKeys(new Set());
    setGrade(null);
    setGrading(false);
    setSessionXp(0);
    setEnterKey((k) => k + 1);
    setDeepMono("");
    setDeepRefs(refs);
    setDeepGuide(rich.quickRef || "");
    setReviewDueDays(null);
    setSessionResult(null);
    setAwardedBeats(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: lessonId is the session key
  }, [lessonId]);

  async function awardBeat(beat: SessionBeat, correct?: boolean | null) {
    if (awardedBeats.has(beat)) return null;
    try {
      const r = await awardFn({ data: { lessonId, beat, correct: correct ?? null } });
      if (r.awarded) {
        setAwardedBeats((s) => new Set(s).add(beat));
        setSessionXp((x) => x + r.xp);
        toast.success(`+${r.xp} XP · ${beatLabel(beat)}`, { duration: 1800 });
        refreshProgress();
      } else {
        setAwardedBeats((s) => new Set(s).add(beat));
      }
      if (beat === "session") setSessionResult(r);
      if (beat === "case" && r.review_due_days != null) setReviewDueDays(r.review_due_days);
      return r;
    } catch (e) {
      console.error("award beat", e);
      return null;
    }
  }

  useEffect(() => {
    window.scrollTo({ top: Math.max(0, (document.getElementById("lesson-player-anchor")?.offsetTop ?? 0) - 80), behavior: "smooth" });
  }, [phaseIdx, slideIdx, mode, enterKey]);

  async function openDeepen() {
    setMode("deepen");
    if (deepMono || !hasMonograph) return;
    setDeepLoading(true);
    try {
      const data = await monoFn({ data: { lessonId } });
      setDeepMono(data.monograph || "");
      setDeepRefs(data.refs?.length ? data.refs : refs);
      if (data.quickRef) setDeepGuide(data.quickRef);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao carregar monografia");
    } finally {
      setDeepLoading(false);
    }
  }

  const phase = phases[phaseIdx] ?? "done";
  const totalSlides = rich.slides.length;

  // Progress across the whole session (slides count as micro-steps)
  const { progressPct, stepLabel } = useMemo(() => {
    let done = 0;
    let total = 0;
    for (const p of phases) {
      if (p === "slides") {
        total += Math.max(1, totalSlides);
        if (phase === "slides") done += slideIdx;
        else if (phases.indexOf(p) < phaseIdx) done += totalSlides;
      } else {
        total += 1;
        if (phases.indexOf(p) < phaseIdx) done += 1;
        else if (p === phase && p === "done") done += 1;
      }
    }
    const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
    let label = "Sessão";
    if (phase === "slides") label = `Lâmina ${slideIdx + 1} de ${totalSlides}`;
    else if (phase === "keys") label = "Pontos-chave";
    else if (phase === "case") label = "Caso clínico";
    else if (phase === "done") label = "Sessão concluída";
    return { progressPct: pct, stepLabel: label };
  }, [phases, phase, phaseIdx, slideIdx, totalSlides]);

  function bumpPhase() {
    setEnterKey((k) => k + 1);
    setPhaseIdx((i) => Math.min(phases.length - 1, i + 1));
  }

  async function continueFromSlide() {
    if (slideIdx < totalSlides - 1) {
      setEnterKey((k) => k + 1);
      setSlideIdx((i) => i + 1);
      return;
    }
    await awardBeat("slides");
    bumpPhase();
  }

  async function continueFromKeys() {
    if (revealedKeys.size < (keyPoints?.length ?? 0)) {
      setRevealedKeys(new Set((keyPoints ?? []).map((_, i) => i)));
      return;
    }
    await awardBeat("keys");
    bumpPhase();
  }

  async function enqueueReview(correct: boolean) {
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data: existing } = await supabase
        .from("review_cards")
        .select("ease, interval_days, reps, lapses")
        .eq("user_id", u.user.id)
        .eq("case_key", lessonId)
        .maybeSingle();
      const prev = existing ?? { ease: 2.5, interval_days: 0, reps: 0, lapses: 0 };
      const n = nextReview(prev, correct);
      await supabase.from("review_cards").upsert(
        {
          user_id: u.user.id,
          case_key: lessonId,
          ease: n.ease,
          interval_days: n.interval_days,
          reps: n.reps,
          lapses: n.lapses,
          due_date: addDays(todaySP(), n.interval_days),
          last_reviewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,case_key" },
      );
      return n.interval_days;
    } catch (e) {
      console.error("review enqueue", e);
      return correct ? 1 : 1;
    }
  }

  async function onCaseAnswer(option: number) {
    if (grade || grading) return;
    setGrading(true);
    try {
      const g = await gradeFn({ data: { lessonId, option } });
      setGrade(g);
      const due = await enqueueReview(g.correct);
      setReviewDueDays(due);
      const award = await awardBeat("case", g.correct);
      const days = award?.review_due_days ?? due ?? (g.correct ? 1 : 1);
      if (g.correct) {
        toast.success(`Conduta correta · volta em ${days} dia${days === 1 ? "" : "s"}`);
      } else {
        toast.message(`Revise o raciocínio · cartão volta amanhã`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao corrigir o caso");
    } finally {
      setGrading(false);
    }
  }

  async function continueAfterCase() {
    bumpPhase();
  }

  // Session beat (streak + daily goal) fires once when the celebration screen opens.
  useEffect(() => {
    if (phase === "done") void awardBeat("session");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function finishSession() {
    if (enrolled && !alreadyDone) onComplete();
    else if (alreadyDone) toast.message("Aula já registrada no progresso");
  }

  if (mode === "deepen") {
    return (
      <div id="lesson-player-anchor" className="mt-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMode("play")}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-gold hover:text-gold-soft"
          >
            ← Voltar à sessão
          </button>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Aprofundar</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasMonograph && <DeepTab active icon={<BookOpen className="h-3.5 w-3.5" />} label="Monografia" />}
          {(hasGuide || !!deepGuide) && (
            <DeepTab active={false} icon={<Layers className="h-3.5 w-3.5" />} label="Guia de bolso" />
          )}
          <DeepTab active={false} icon={<MessageSquareText className="h-3.5 w-3.5" />} label="Tutor IA" />
        </div>

        {deepLoading && (
          <p className="text-sm font-light text-muted-foreground animate-pulse">Carregando tratado…</p>
        )}

        {!deepLoading && hasMonograph && deepMono && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <LessonMarkdown>{deepMono}</LessonMarkdown>
            {!!deepRefs.length && (
              <section className="mt-10 border-t border-border/60 pt-6">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  <BookOpen className="h-3 w-3" /> Referências primárias
                </div>
                <ol className="mt-4 space-y-2 text-xs text-muted-foreground">
                  {deepRefs.map((r, i) => (
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
          </section>
        )}

        {!deepLoading && hasMonograph && !deepMono && (
          <p className="text-sm text-muted-foreground">Monografia indisponível nesta aula.</p>
        )}

        {(hasGuide || !!deepGuide) && (
          <section className="pt-4">
            <QuickReferenceCard title={lessonTitle} md={deepGuide || rich.quickRef} />
          </section>
        )}

        <section className="pt-2">
          <LessonTutor lessonId={lessonId} lessonTitle={lessonTitle} />
        </section>
      </div>
    );
  }

  const primaryLabel =
    phase === "slides"
      ? slideIdx < totalSlides - 1
        ? "Continuar"
        : hasKeys || hasCase
          ? "Próximo passo"
          : "Concluir lâminas"
      : phase === "keys"
        ? revealedKeys.size < (keyPoints?.length ?? 0)
          ? "Revelar todos"
          : hasCase
            ? "Ir ao caso clínico"
            : "Finalizar"
        : phase === "case" && grade
          ? "Continuar"
          : null;

  const onPrimary =
    phase === "slides"
      ? continueFromSlide
      : phase === "keys"
        ? continueFromKeys
        : phase === "case" && grade
          ? () => void continueAfterCase()
          : null;

  return (
    <div id="lesson-player-anchor" className="mt-6 pb-28">
      {/* Session HUD */}
      <div className="relative overflow-hidden rounded-sm border border-gold/20 bg-card/90 p-5 shadow-[var(--shadow-elegant)] backdrop-blur-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.32em] text-gold">Sessão clínica</div>
            <div className="mt-1 font-display text-base tracking-tight text-foreground/90">{stepLabel}</div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DailyGoalPill
              sessions={progress?.sessionsToday ?? 0}
              goal={progress?.dailyGoal ?? 1}
              met={!!progress?.goalMet}
              streak={progress?.streak ?? 0}
            />
            {sessionXp > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-gold animate-in zoom-in-50 duration-300">
                <Sparkles className="h-3.5 w-3.5" /> +{sessionXp} XP
              </span>
            )}
            {canDeepen && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void openDeepen()}
                className="h-8 rounded-sm border-gold/40 text-[10px] uppercase tracking-[0.2em] text-gold hover:bg-gold/10"
              >
                <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Aprofundar
              </Button>
            )}
          </div>
        </div>
        <Progress value={progressPct} className="mt-3 h-1.5 bg-secondary [&>div]:bg-gold [&>div]:transition-all [&>div]:duration-500" />
        <PhaseDots phases={phases} phaseIdx={phaseIdx} />
      </div>

      <div key={enterKey} className="mt-6 animate-in fade-in slide-in-from-right-3 duration-300 fill-mode-both">
        {phase === "slides" && (
          <div className="space-y-4">
            <ClinicalSlideDeck
              slides={rich.slides}
              index={slideIdx}
              onIndexChange={setSlideIdx}
              showChrome
            />
            <p className="text-xs font-light text-muted-foreground">
              Uma ideia por lâmina · setas do teclado · Continuar fecha o circuito
            </p>
          </div>
        )}

        {phase === "keys" && keyPoints && (
          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Memória ativa</div>
            <h3 className="text-2xl font-extralight">Toque para revelar os pontos-chave</h3>
            <p className="text-sm font-light text-muted-foreground">
              Recupere antes de ler — fortalece retenção (estilo SRS).
            </p>
            <ul className="space-y-3">
              {keyPoints.map((k, i) => {
                const open = revealedKeys.has(i);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setRevealedKeys((s) => new Set(s).add(i))}
                      className={cn(
                        "w-full rounded-sm border p-4 text-left transition duration-300",
                        open
                          ? "border-gold/40 bg-gold/10"
                          : "border-border/60 bg-card hover:border-gold/40 hover:bg-gold/5",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-gold">{i + 1}</span>
                        <span className={cn("text-sm font-light leading-relaxed", !open && "blur-[5px] select-none")}>
                          {open ? k : "Toque para revelar este ponto clínico"}
                        </span>
                        {open && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-gold" />}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {phase === "case" && publicCase && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
              <Stethoscope className="h-3.5 w-3.5" /> Decisão clínica
            </div>
            <ClinicalCaseSimulator
              key={lessonId}
              c={publicCase}
              grade={grade}
              grading={grading}
              onAnswer={onCaseAnswer}
            />
            {grade && (
              <div className="rounded-sm border border-gold/30 bg-gold/5 p-4 animate-in fade-in duration-300">
                <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Revisão espaçada</div>
                <p className="mt-2 text-sm font-light">
                  {grade.correct
                    ? `Conduta correta — este caso volta em ${reviewDueDays ?? 1} dia${(reviewDueDays ?? 1) === 1 ? "" : "s"}.`
                    : "Errou com propósito — o cartão volta amanhã na Revisão."}
                </p>
                <Link to="/revisao" className="mt-2 inline-block text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-gold">
                  Abrir fila de revisão →
                </Link>
              </div>
            )}
          </div>
        )}

        {phase === "done" && (
          <div className="relative overflow-hidden rounded-sm border border-gold/30 bg-gradient-to-br from-gold/15 via-card to-card p-8 text-center md:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative animate-in zoom-in-95 fade-in duration-500">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                <Flame className="h-6 w-6 text-gold" />
              </div>
              <h3 className="mt-5 text-3xl font-extralight">
                {(sessionResult?.goal_met ?? progress?.goalMet) ? "Meta diária cumprida" : "Sessão concluída"}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm font-light text-muted-foreground">
                Loop fechado: lâminas{hasKeys ? " → chaves" : ""}
                {hasCase ? " → caso" : ""}. Volte amanhã para manter a sequência.
              </p>

              <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-2">
                <CelebrateStat label="XP da sessão" value={`+${sessionXp}`} />
                <CelebrateStat
                  label="Sequência"
                  value={`${sessionResult?.streak ?? progress?.streak ?? 0}d`}
                />
                <CelebrateStat
                  label="Hoje"
                  value={`${sessionResult?.sessions_today ?? progress?.sessionsToday ?? 0}/${sessionResult?.daily_goal ?? progress?.dailyGoal ?? 1}`}
                />
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {enrolled && (
                  <Button
                    onClick={finishSession}
                    disabled={alreadyDone}
                    className="h-11 rounded-sm bg-gold px-6 text-primary-foreground hover:bg-gold-soft disabled:opacity-60"
                  >
                    {alreadyDone ? "Já no progresso ✓" : "Registrar aula · +30 XP"}
                  </Button>
                )}
                {canDeepen && (
                  <Button variant="outline" onClick={() => void openDeepen()} className="h-11 rounded-sm border-border/60">
                    <BookOpen className="mr-2 h-4 w-4" /> Aprofundar
                  </Button>
                )}
                {hasNextLesson && onNextLesson && (
                  <Button variant="ghost" onClick={onNextLesson} className="h-11 rounded-sm">
                    Próxima aula <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {onPrimary && primaryLabel && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md md:px-6 mb-[3.25rem] md:mb-0">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 lg:pl-[240px]">
            <div className="hidden text-xs font-light text-muted-foreground sm:block">{stepLabel}</div>
            <Button
              type="button"
              onClick={onPrimary}
              className="ml-auto h-12 min-w-[10rem] rounded-sm bg-gold px-8 text-sm text-primary-foreground hover:bg-gold-soft"
            >
              {primaryLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile tutor shortcut stays available during play */}
      <Sheet>
        <SheetTrigger asChild>
          <Button className="fixed bottom-28 right-4 z-40 h-11 rounded-full bg-secondary px-4 text-xs shadow-lg hover:bg-secondary/80 md:bottom-24">
            <MessageSquareText className="mr-2 h-4 w-4" /> Tutor
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto p-3">
          <SheetHeader className="sr-only">
            <SheetTitle>Tutor IA</SheetTitle>
          </SheetHeader>
          <LessonTutor lessonId={lessonId} lessonTitle={lessonTitle} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PhaseDots({ phases, phaseIdx }: { phases: Phase[]; phaseIdx: number }) {
  const label: Record<Phase, string> = {
    slides: "Lâminas",
    keys: "Chaves",
    case: "Caso",
    done: "Fim",
  };
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {phases.map((p, i) => (
        <span
          key={p}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[9px] uppercase tracking-[0.2em] transition-colors duration-300",
            i < phaseIdx
              ? "bg-gold/15 text-gold"
              : i === phaseIdx
                ? "bg-gold text-primary-foreground"
                : "bg-secondary text-muted-foreground",
          )}
        >
          {i < phaseIdx ? <CheckCircle2 className="h-3 w-3" /> : null}
          {label[p]}
        </span>
      ))}
    </div>
  );
}

function DeepTab({ active, icon, label }: { active: boolean; icon: ReactNode; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em]",
        active ? "border-gold/40 text-gold" : "border-border/60 text-muted-foreground",
      )}
    >
      {icon}
      {label}
    </span>
  );
}

function beatLabel(beat: SessionBeat) {
  switch (beat) {
    case "slides":
      return "Lâminas";
    case "keys":
      return "Pontos-chave";
    case "case":
      return "Caso";
    case "session":
      return "Sessão";
  }
}

function DailyGoalPill({
  sessions,
  goal,
  met,
  streak,
}: {
  sessions: number;
  goal: number;
  met: boolean;
  streak: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]",
        met ? "border-gold/50 bg-gold/10 text-gold" : "border-border/60 text-muted-foreground",
      )}
    >
      <Flame className="h-3 w-3" />
      Hoje {Math.min(sessions, goal)}/{goal}
      <span className="opacity-50">·</span>
      {streak}d
    </span>
  );
}

function CelebrateStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border/50 bg-background/50 px-3 py-3">
      <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-light text-gold">{value}</div>
    </div>
  );
}
