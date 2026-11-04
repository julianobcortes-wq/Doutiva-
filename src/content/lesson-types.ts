export type Slide =
  | { kind: "title"; eyebrow?: string; title: string; subtitle?: string }
  | { kind: "bullets"; title: string; bullets: string[]; note?: string }
  | { kind: "bars"; title: string; unit: string; bars: { label: string; value: number; highlight?: boolean }[]; source: string; note?: string }
  | { kind: "flow"; title: string; steps: { label: string; detail?: string }[]; note?: string }
  | { kind: "table"; title: string; head: string[]; rows: string[][]; source?: string }
  | { kind: "split"; title: string; left: { label: string; items: string[] }; right: { label: string; items: string[] } }
  | { kind: "pearl"; title: string; text: string; source?: string };

export type CaseOption = { label: string; correct: boolean; rationale: string };

export type ClinicalCase = {
  title: string;
  vignette: string;
  data: { label: string; value: string }[];
  question: string;
  options: CaseOption[];
  teaching: string;
  reward: number;
};

export type RichLesson = {
  slides: Slide[];
  monograph: string;
  clinicalCase: ClinicalCase;
  quickRef: string;
};
