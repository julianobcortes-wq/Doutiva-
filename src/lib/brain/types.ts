/** Shared types for the Doutiva brain — AI-first orchestrator. */

export type MasteryBand = "green" | "yellow" | "red";

export type BrainFace =
  | "cartographer"
  | "preceptor"
  | "librarian"
  | "studio"
  | "matchmaker";

export type ConfidenceLabel = "sei" | "acho" | "nao_sei";

export type ClinicalTopic = {
  id: string;
  slug: string;
  title: string;
  specialty: string;
  summary: string | null;
  parent_id: string | null;
  sort_order: number;
};

export type MasteryRow = {
  topic_id: string;
  score: number;
  band: MasteryBand;
  confidence_avg: number;
  attempts: number;
  last_seen_at: string;
  updated_at: string;
  topic?: ClinicalTopic;
};

export type MasteryMap = {
  topics: ClinicalTopic[];
  mastery: MasteryRow[];
  counts: { green: number; yellow: number; red: number; untouched: number };
  ready: boolean;
};

export type CartographerProbe = {
  topic_id: string;
  topic_slug: string;
  question: string;
  rationale?: string;
};

export type CartographerTurnResult = {
  reply: string;
  probe?: CartographerProbe | null;
  assessment?: {
    topic_id: string;
    score: number;
    confidence: number;
    confidence_label: ConfidenceLabel;
    note: string;
  } | null;
  map_complete?: boolean;
  summary?: string | null;
};

export function bandFromScore(score: number, confidence = 0.5): MasteryBand {
  if (score >= 75 && confidence >= 0.65) return "green";
  if (score >= 45) return "yellow";
  return "red";
}

export function confidenceToNumber(label: ConfidenceLabel): number {
  if (label === "sei") return 0.9;
  if (label === "acho") return 0.55;
  return 0.2;
}
