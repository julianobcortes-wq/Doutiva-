import type { CaseOption, ClinicalCase } from "@/content/lesson-types";

/** Student-facing case: no answer key, rationale, or teaching until the server grades. */
export type PublicCaseOption = { label: string };

export type PublicClinicalCase = {
  title: string;
  vignette: string;
  data: { label: string; value: string }[];
  question: string;
  options: PublicCaseOption[];
};

export type CaseGradeResult = {
  correct: boolean;
  picked: number;
  options: CaseOption[];
  teaching: string;
  reward: number;
};

export function toPublicClinicalCase(c: ClinicalCase): PublicClinicalCase {
  return {
    title: c.title,
    vignette: c.vignette,
    data: c.data,
    question: c.question,
    options: c.options.map((o) => ({ label: o.label })),
  };
}

export function gradeClinicalCase(c: ClinicalCase, option: number): CaseGradeResult {
  if (!Number.isInteger(option) || option < 0 || option >= c.options.length) {
    throw new Error("Resposta inválida");
  }
  return {
    correct: !!c.options[option]?.correct,
    picked: option,
    options: c.options,
    teaching: c.teaching,
    reward: c.reward,
  };
}

/** Redact clinical_case JSON before it leaves the server toward a student client. */
export function redactClinicalCaseJson(raw: unknown): PublicClinicalCase | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const vignette = typeof r.vignette === "string" ? r.vignette : "";
  const optionsRaw = Array.isArray(r.options) ? r.options : [];
  const options = optionsRaw
    .map((o) => {
      if (!o || typeof o !== "object") return null;
      const label = String((o as Record<string, unknown>).label ?? "").trim();
      return label ? { label } : null;
    })
    .filter((o): o is PublicCaseOption => !!o);
  if (!vignette || options.length < 2) return null;
  const data = Array.isArray(r.data)
    ? r.data
        .map((d) => {
          if (!d || typeof d !== "object") return null;
          const row = d as Record<string, unknown>;
          const label = String(row.label ?? "").trim();
          const value = String(row.value ?? "");
          return label ? { label, value } : null;
        })
        .filter((d): d is { label: string; value: string } => !!d)
    : [];
  return {
    title: typeof r.title === "string" ? r.title : "",
    vignette,
    question: typeof r.question === "string" ? r.question : "",
    data,
    options,
  };
}
