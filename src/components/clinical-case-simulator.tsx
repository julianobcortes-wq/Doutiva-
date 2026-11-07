import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Stethoscope, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonMarkdown } from "@/components/lesson-markdown";
import type { ClinicalCase } from "@/content/lesson-types";
import type { CaseGradeResult, PublicClinicalCase } from "@/lib/clinical-case-public";

type Props = {
  /** Prefer PublicClinicalCase for student flows (no answer key). Full ClinicalCase is for Studio preview only. */
  c: PublicClinicalCase | ClinicalCase;
  /** Server-graded reveal. When set, shows rationales/teaching from the server. */
  grade?: CaseGradeResult | null;
  /** Called with the option index only — never trust client-side correctness. */
  onAnswer?: (option: number) => void;
  rewardLabel?: string;
  grading?: boolean;
  /** Studio/local preview: allow revealing from embedded keys (admin editor only). */
  allowClientReveal?: boolean;
};

function hasEmbeddedKeys(c: PublicClinicalCase | ClinicalCase): c is ClinicalCase {
  return Array.isArray(c.options) && c.options.some((o) => "correct" in o);
}

export function ClinicalCaseSimulator({
  c,
  grade = null,
  onAnswer,
  rewardLabel,
  grading = false,
  allowClientReveal = false,
}: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const [localGrade, setLocalGrade] = useState<CaseGradeResult | null>(null);

  useEffect(() => {
    setPicked(null);
    setLocalGrade(null);
  }, [c]);

  const reveal = grade ?? localGrade;
  const answered = reveal !== null || (picked !== null && !!grade);
  const showAnswered = reveal !== null;
  const right = reveal?.correct ?? false;
  const options = reveal?.options ?? c.options;

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-border/60 bg-card p-5 md:p-7">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
          <Stethoscope className="h-3.5 w-3.5" /> Caso clínico
        </div>
        <h3 className="mt-3 text-2xl font-extralight">{c.title}</h3>
        <p className="mt-4 text-sm font-light leading-relaxed text-foreground/90 md:text-base">{c.vignette}</p>
        <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 md:grid-cols-3">
          {c.data.map((d) => (
            <div key={d.label} className="bg-card p-3">
              <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{d.label}</dt>
              <dd className="mt-1 text-sm tabular-nums">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Sua conduta</div>
        <p className="mt-2 text-lg font-light">{c.question}</p>
        <div className="mt-4 space-y-3">
          {options.map((o, k) => {
            const isCorrect = "correct" in o ? !!o.correct : reveal?.options[k]?.correct;
            const rationale = "rationale" in o ? o.rationale : reveal?.options[k]?.rationale;
            const show = showAnswered && (k === (reveal?.picked ?? picked) || isCorrect);
            return (
              <button
                key={k}
                disabled={showAnswered || grading || picked !== null}
                onClick={() => {
                  setPicked(k);
                  if (allowClientReveal && hasEmbeddedKeys(c)) {
                    const full = c.options[k];
                    setLocalGrade({
                      correct: !!full.correct,
                      picked: k,
                      options: c.options,
                      teaching: c.teaching,
                      reward: c.reward,
                    });
                  }
                  onAnswer?.(k);
                }}
                className={`w-full rounded-sm border p-4 text-left transition ${
                  !showAnswered
                    ? "border-border/60 hover:border-gold/50 hover:bg-gold/5"
                    : isCorrect
                      ? "border-gold/60 bg-gold/10"
                      : k === (reveal?.picked ?? picked)
                        ? "border-destructive/60 bg-destructive/10"
                        : "border-border/40 opacity-60"
                }`}
              >
                <div className="flex gap-3">
                  <span className="mt-0.5 text-xs text-gold">{String.fromCharCode(65 + k)}</span>
                  <div className="flex-1">
                    <div className="text-sm font-light">{o.label}</div>
                    {show && rationale && (
                      <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">{rationale}</p>
                    )}
                  </div>
                  {showAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />}
                  {showAnswered && k === (reveal?.picked ?? picked) && !isCorrect && (
                    <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {grading && !showAnswered && (
        <p className="text-sm text-muted-foreground">Corrigindo no servidor…</p>
      )}

      {showAnswered && reveal && (
        <div className="rounded-sm border border-gold/30 bg-gold/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold">
              {rewardLabel ?? (right ? `Conduta correta · +${reveal.reward} XP` : "Revise o raciocínio")}
            </div>
            {allowClientReveal && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setPicked(null);
                  setLocalGrade(null);
                }}
                className="h-8 rounded-sm text-xs"
              >
                <RotateCcw className="mr-1 h-3 w-3" /> Refazer
              </Button>
            )}
          </div>
          <div className="mt-3">
            <LessonMarkdown>{reveal.teaching}</LessonMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
