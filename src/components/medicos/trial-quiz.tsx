import { useState } from "react";
import { CheckCircle2, Loader2, Stethoscope, XCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { LessonMarkdown } from "@/components/lesson-markdown";
import { registrarEvento } from "@/components/visit-tracker";
import { gradeTrialCase } from "@/lib/trial-cases.functions";
import type { TrialCasePublic } from "@/lib/trial-cases";

export const TRIAL_STORAGE_KEY = "dtv_trial";

export type TrialConfidence = "sei" | "acho" | "nao_sei";

export type TrialAnswer = {
  caseKey: string;
  theme: string;
  option: number;
  confidence?: TrialConfidence;
  correct: boolean;
  correctOption: number;
  explanation: string;
};

export type StoredTrialState = {
  version: 1;
  open: boolean;
  index: number;
  showResult: boolean;
  answers: TrialAnswer[];
};

const CONFIDENCE_OPTIONS: readonly { value: TrialConfidence; label: string }[] = [
  { value: "sei", label: "Sei" },
  { value: "acho", label: "Acho" },
  { value: "nao_sei", label: "Não sei" },
];

export function emptyTrialState(): StoredTrialState {
  return { version: 1, open: false, index: 0, showResult: false, answers: [] };
}

export function readStoredTrialState(): StoredTrialState {
  if (typeof window === "undefined") return emptyTrialState();
  try {
    const raw = window.sessionStorage.getItem(TRIAL_STORAGE_KEY);
    if (!raw) return emptyTrialState();
    const parsed = JSON.parse(raw) as Partial<StoredTrialState>;
    if (parsed.version !== 1 || !Array.isArray(parsed.answers)) return emptyTrialState();
    const answers = parsed.answers.filter(
      (a): a is TrialAnswer =>
        Boolean(a) &&
        typeof a.caseKey === "string" &&
        typeof a.theme === "string" &&
        typeof a.option === "number" &&
        typeof a.correct === "boolean" &&
        typeof a.correctOption === "number" &&
        typeof a.explanation === "string",
    );
    return {
      version: 1,
      open: Boolean(parsed.open),
      index: typeof parsed.index === "number" && parsed.index >= 0 ? parsed.index : 0,
      showResult: Boolean(parsed.showResult),
      answers,
    };
  } catch {
    return emptyTrialState();
  }
}

export function writeStoredTrialState(state: StoredTrialState) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable (private mode): keep state in memory only
  }
}

/** True when the physician answered correctly and did not mark "Não sei". */
export function isThemeMastered(answer: Pick<TrialAnswer, "correct" | "confidence">): boolean {
  return answer.correct && answer.confidence !== "nao_sei";
}

type TrialQuizProps = {
  cases: readonly TrialCasePublic[];
  state: StoredTrialState;
  onStateChange: (next: StoredTrialState) => void;
  onDirectSignup: () => void;
};

export function TrialQuiz({ cases, state, onStateChange, onDirectSignup }: TrialQuizProps) {
  const submitGrade = useServerFn(gradeTrialCase);
  const [confidence, setConfidence] = useState<TrialConfidence | undefined>(undefined);
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);

  if (cases.length === 0) return null;

  if (state.showResult) {
    return (
      <div className="rounded-sm border border-border/70 bg-card/60 p-5 md:p-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Amostra concluída</p>
        <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl">Seu primeiro mapa</h2>

        <ul className="mt-4 divide-y divide-border/60 rounded-sm border border-border/60 bg-background/50">
          {cases.map((item) => {
            const answer = state.answers.find((a) => a.caseKey === item.key);
            const domina = answer ? isThemeMastered(answer) : false;
            return (
              <li
                key={item.key}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm"
              >
                <span className="font-medium text-foreground">{item.theme}</span>
                <span
                  className={`shrink-0 rounded-sm border px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em] ${
                    domina
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-rose-500/35 bg-rose-500/10 text-rose-800 dark:text-rose-200"
                  }`}
                >
                  {domina ? "Domina" : "Lacuna"}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
          Isto é uma amostra. O diagnóstico completo, com mais casos, monta a sua trilha.
        </p>
      </div>
    );
  }

  const safeIndex = Math.min(state.index, cases.length - 1);
  const current = cases[safeIndex];
  const currentAnswer = state.answers.find((a) => a.caseKey === current.key) ?? null;
  const isLastCase = safeIndex === cases.length - 1;

  async function handleOptionClick(optionIndex: number) {
    if (grading || currentAnswer) return;
    setGradeError(null);
    setGrading(true);
    try {
      const result = await submitGrade({
        data: {
          caseKey: current.key,
          option: optionIndex,
        },
      });

      const nextAnswer: TrialAnswer = {
        caseKey: current.key,
        theme: current.theme,
        option: optionIndex,
        confidence,
        correct: result.correct,
        correctOption: result.correctOption,
        explanation: result.explanation,
      };

      const filtered = state.answers.filter((a) => a.caseKey !== current.key);
      const nextState: StoredTrialState = {
        ...state,
        open: true,
        index: safeIndex,
        answers: [...filtered, nextAnswer],
      };
      onStateChange(nextState);

      const stepEvent = safeIndex === 0 ? "teste_caso1" : safeIndex === 1 ? "teste_caso2" : "teste_caso3";
      registrarEvento(stepEvent);
    } catch {
      setGradeError("Não foi possível corrigir este caso agora. Tente novamente.");
    } finally {
      setGrading(false);
    }
  }

  function handleNext() {
    setConfidence(undefined);
    setGradeError(null);
    if (isLastCase) {
      registrarEvento("teste_resultado");
      onStateChange({
        ...state,
        open: true,
        showResult: true,
      });
      return;
    }
    onStateChange({
      ...state,
      open: true,
      index: safeIndex + 1,
    });
  }

  return (
    <div className="rounded-sm border border-border/70 bg-card/60 p-5 md:p-7">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-gold">
          <Stethoscope className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{current.theme}</span>
        </span>
        <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Caso {safeIndex + 1} de {cases.length}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-1.5" aria-hidden="true">
        {cases.map((item, idx) => (
          <span
            key={item.key}
            className={`h-1 rounded-full ${idx <= safeIndex ? "bg-gold" : "bg-secondary"}`}
          />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <h2 className="font-serif text-xl leading-snug sm:text-2xl">{current.caseData.title}</h2>
        <p className="text-sm leading-relaxed text-foreground/90">{current.caseData.vignette}</p>

        {current.caseData.data.length > 0 && (
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 sm:grid-cols-3">
            {current.caseData.data.map((d) => (
              <div key={d.label} className="bg-background/80 p-2.5">
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {d.label}
                </dt>
                <dd className="mt-0.5 text-xs font-medium tabular-nums text-foreground">{d.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium leading-snug text-foreground">{current.caseData.question}</p>

        {!currentAnswer && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] text-muted-foreground">Quão seguro você está?</span>
            {CONFIDENCE_OPTIONS.map((opt) => {
              const active = confidence === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConfidence(active ? undefined : opt.value)}
                  aria-pressed={active}
                  className={`rounded-sm border px-2.5 py-1 text-xs transition ${
                    active
                      ? "border-gold/70 bg-gold/15 text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-3.5 space-y-2.5">
          {current.caseData.options.map((opt, idx) => {
            const answered = currentAnswer !== null;
            const isPicked = answered && currentAnswer.option === idx;
            const isCorrectOpt = answered && currentAnswer.correctOption === idx;
            return (
              <button
                key={idx}
                type="button"
                disabled={answered || grading}
                onClick={() => void handleOptionClick(idx)}
                className={`w-full rounded-sm border p-3.5 text-left transition ${
                  !answered
                    ? "border-border/70 bg-background/40 hover:border-gold/60 hover:bg-gold/5"
                    : isCorrectOpt
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : isPicked
                        ? "border-destructive/60 bg-destructive/10"
                        : "border-border/40 opacity-55"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-xs font-medium text-gold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 text-sm leading-snug text-foreground">{opt.label}</span>
                  {answered && isCorrectOpt && (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  )}
                  {answered && isPicked && !isCorrectOpt && (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {grading && (
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Conferindo conduta…
          </p>
        )}

        {gradeError && (
          <p role="alert" className="mt-3 text-xs text-destructive">
            {gradeError}
          </p>
        )}

        {currentAnswer && (
          <div className="mt-4 space-y-3 rounded-sm border border-gold/35 bg-gold/5 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em]">
              {currentAnswer.correct ? (
                <span className="text-emerald-600 dark:text-emerald-400">Conduta correta</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-300">Revise o raciocínio</span>
              )}
            </div>
            {currentAnswer.explanation && (
              <div className="text-sm leading-relaxed text-foreground/90">
                <LessonMarkdown>{currentAnswer.explanation}</LessonMarkdown>
              </div>
            )}
            <Button type="button" onClick={handleNext} className="w-full">
              {isLastCase ? "Ver meu primeiro mapa" : "Próximo caso"}
            </Button>
          </div>
        )}
      </div>

      {!currentAnswer && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onDirectSignup}
            className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Prefiro criar a conta direto
          </button>
        </div>
      )}
    </div>
  );
}
