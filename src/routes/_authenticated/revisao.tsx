import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listReviewCases, answerReviewCase } from "@/lib/daily-case.functions";
import type { PublicDailyCase } from "@/lib/daily-case";
import type { CaseGradeResult } from "@/lib/clinical-case-public";
import { nextReview, addDays } from "@/lib/review";
import { ClinicalCaseSimulator } from "@/components/clinical-case-simulator";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/revisao")({
  head: () => ({
    meta: [
      { title: "Revisão espaçada — Doutiva" },
      {
        name: "description",
        content: "Questões das aulas que voltam no dia certo para fixar o raciocínio clínico.",
      },
    ],
  }),
  component: ReviewPage,
});

type Card = {
  case_key: string;
  ease: number;
  interval_days: number;
  reps: number;
  lapses: number;
  due_date: string;
};
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

function ReviewPage() {
  const [cases, setCases] = useState<PublicDailyCase[] | null>(null);
  const [cards, setCards] = useState<Record<string, Card>>({});
  const [idx, setIdx] = useState(0);
  const [grade, setGrade] = useState<CaseGradeResult | null>(null);
  const [grading, setGrading] = useState(false);
  const [stats, setStats] = useState({ ok: 0, miss: 0 });
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadCases = useServerFn(listReviewCases);
  const gradeFn = useServerFn(answerReviewCase);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    Promise.all([loadCases(), supabase.from("review_cards").select("*")])
      .then(([list, cardsRes]) => {
        if (cancelled) return;
        setCases(list);
        const m: Record<string, Card> = {};
        for (const r of cardsRes.data ?? []) m[r.case_key] = r as Card;
        setCards(m);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error(e);
        setCases([]);
        setLoadError(e instanceof Error ? e.message : "Falha ao carregar a revisão.");
      });
    return () => {
      cancelled = true;
    };
  }, [loadCases]);

  const queue = useMemo(() => {
    if (!cases) return [];
    const t = today();
    const due = cases.filter((c) => cards[c.key] && cards[c.key].due_date <= t);
    const fresh = cases.filter((c) => !cards[c.key]).slice(0, 5);
    return [...due, ...fresh];
  }, [cases, cards]);

  async function onPick(c: PublicDailyCase, option: number) {
    if (grade || grading) return;
    setGrading(true);
    try {
      const g = await gradeFn({ data: { caseKey: c.key, option } });
      setGrade(g);
      setStats((s) => (g.correct ? { ...s, ok: s.ok + 1 } : { ...s, miss: s.miss + 1 }));
      const prev = cards[c.key] ?? { ease: 2.5, interval_days: 0, reps: 0, lapses: 0 };
      const n = nextReview(prev, g.correct);
      const row = { ...n, case_key: c.key, due_date: addDays(today(), n.interval_days) };
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      await supabase.from("review_cards").upsert(
        { ...row, user_id: u.user.id, last_reviewed_at: new Date().toISOString() },
        { onConflict: "user_id,case_key" },
      );
      setCards((m) => ({ ...m, [c.key]: row }));
    } catch (e) {
      console.error(e);
    } finally {
      setGrading(false);
    }
  }

  if (!cases) return <div className="p-10 text-sm text-muted-foreground">Carregando revisão…</div>;
  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <p className="text-sm text-destructive">Não foi possível carregar a revisão: {loadError}</p>
        <Button asChild variant="outline">
          <Link to="/dashboard">Voltar ao campus</Link>
        </Button>
      </div>
    );
  }
  const current = queue[idx];
  const upcoming = Object.values(cards).filter((c) => c.due_date > today()).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Revisão espaçada</p>
        <h1 className="mt-2 text-3xl font-light">Fixe o raciocínio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acertou, a questão volta mais tarde. Errou, volta amanhã. {queue.length} para hoje · {upcoming}{" "}
          agendadas.
        </p>
      </header>

      {current ? (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {idx + 1} de {queue.length} · {current.courseTitle} — {current.lessonTitle}
          </p>
          <ClinicalCaseSimulator
            key={current.key}
            c={current.c}
            grade={grade}
            grading={grading}
            onAnswer={(option) => onPick(current, option)}
          />
          {grade && (
            <Button
              onClick={() => {
                setIdx(idx + 1);
                setGrade(null);
              }}
            >
              Próxima
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-lg font-light">Revisão de hoje concluída.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {stats.ok} acertos · {stats.miss} para rever amanhã
          </p>
          <Link to="/caso-do-dia" className="mt-4 inline-block text-sm text-primary underline">
            Ir para o Caso do Dia
          </Link>
        </div>
      )}
    </div>
  );
}
