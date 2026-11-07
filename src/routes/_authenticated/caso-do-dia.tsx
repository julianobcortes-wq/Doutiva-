import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, CalendarDays } from "lucide-react";
import { ClinicalCaseSimulator } from "@/components/clinical-case-simulator";
import { useServerFn } from "@tanstack/react-start";
import { refreshProgress } from "@/lib/use-progress";
import { answerDailyCase, getTodayCase } from "@/lib/daily-case.functions";
import type { PublicDailyCase } from "@/lib/daily-case";
import type { CaseGradeResult } from "@/lib/clinical-case-public";

export const Route = createFileRoute("/_authenticated/caso-do-dia")({
  head: () => ({
    meta: [
      { title: "Caso do Dia — Doutiva" },
      {
        name: "description",
        content: "Um desafio clínico curto por dia para médicos: decida a conduta e aprenda com a evidência.",
      },
      { property: "og:title", content: "Caso do Dia — Doutiva" },
      { property: "og:description", content: "Um desafio clínico curto por dia para médicos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CasoDoDia,
});

function CasoDoDia() {
  const [today, setToday] = useState<PublicDailyCase | null>(null);
  const [grade, setGrade] = useState<CaseGradeResult | null>(null);
  const [grading, setGrading] = useState(false);
  const [reward, setReward] = useState<string | null>(null);
  const load = useServerFn(getTodayCase);
  const submit = useServerFn(answerDailyCase);

  useEffect(() => {
    load().then(setToday).catch(() => setToday(null));
  }, [load]);

  async function answer(option: number) {
    if (!today || grading || grade) return;
    setGrading(true);
    try {
      const r = await submit({ data: { caseKey: String(today.key), option } });
      setGrade(r.grade);
      refreshProgress();
      const head = r.correct ? "Conduta correta" : "Revise o raciocínio";
      setReward(
        r.awarded
          ? `${head} · +${r.xp_awarded} XP · +${r.credits_awarded} Créditos · Sequência ${r.streak} ${r.streak === 1 ? "dia" : "dias"}`
          : `${head} · Caso de hoje já contabilizado`,
      );
    } catch (e) {
      console.error(e);
      setReward("Não foi possível registrar seu progresso agora. Tente novamente.");
    } finally {
      setGrading(false);
    }
  }

  if (!today) return <div className="p-8 text-sm text-muted-foreground">Preparando o plantão…</div>;
  const dateLabel = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-8 sm:px-6">
      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-primary">
        <Flame className="h-3.5 w-3.5" /> Caso do Dia
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="h-3 w-3" /> {dateLabel}
        </span>
      </div>
      <h1 className="mt-3 text-3xl font-extralight tracking-tight sm:text-4xl">Seu paciente de hoje</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Três minutos. Leia, decida a conduta e veja o raciocínio por trás. Um novo caso a cada dia.
      </p>

      <div className="mt-8">
        <ClinicalCaseSimulator
          key={today.key}
          c={today.c}
          onAnswer={answer}
          grade={grade}
          grading={grading}
          rewardLabel={reward ?? undefined}
        />
      </div>

      <div className="mt-8 rounded-sm border border-border/60 bg-card p-5 text-sm">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Quer ir fundo?</span>
        <p className="mt-2 text-muted-foreground">
          Este caso vem da aula “{today.lessonTitle}” do curso {today.courseTitle}.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/academy/$slug"
            params={{ slug: today.courseSlug }}
            className="rounded-sm border border-primary/40 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10"
          >
            Abrir a aula
          </Link>
          <Link
            to="/professores"
            className="rounded-sm border border-border/60 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            Discutir com um Professor de IA
          </Link>
        </div>
      </div>
    </div>
  );
}
