/**
 * Built-in clinical topic catalog — used when `clinical_topics` is not yet
 * migrated on the Supabase project (production launch safety net).
 * Stable UUIDs so mastery persisted in user_metadata survives deploys.
 */
import type { ClinicalTopic } from "@/lib/brain/types";

/** Deterministic ids — do not change once shipped; mastery keys depend on them. */
export const DEFAULT_CLINICAL_TOPICS: ClinicalTopic[] = [
  {
    id: "a1000001-d007-4000-8000-000000000001",
    slug: "incretinas-evidencia",
    title: "Incretinas — evidência (STEP, SURMOUNT, SELECT)",
    specialty: "incretinas",
    summary: "Ensaios pivô e leitura crítica de desfechos.",
    parent_id: null,
    sort_order: 10,
  },
  {
    id: "a1000001-d007-4000-8000-000000000002",
    slug: "incretinas-seguranca",
    title: "Incretinas — segurança e massa magra",
    specialty: "incretinas",
    summary: "EA GI, eventos raros, preservação muscular.",
    parent_id: null,
    sort_order: 20,
  },
  {
    id: "a1000001-d007-4000-8000-000000000003",
    slug: "incretinas-protocolo",
    title: "Incretinas — protocolo de consultório",
    specialty: "incretinas",
    summary: "Seleção, titulação, metas e seguimento.",
    parent_id: null,
    sort_order: 30,
  },
  {
    id: "a1000001-d007-4000-8000-000000000004",
    slug: "eixo-gh-secretagogos",
    title: "Eixo GH — secretagogos",
    specialty: "eixo-gh",
    summary: "Tesamorelina vs marketing (CJC, ipamorelina).",
    parent_id: null,
    sort_order: 40,
  },
  {
    id: "a1000001-d007-4000-8000-000000000005",
    slug: "reparo-bpc-tb500",
    title: "Reparo tecidual — BPC-157 / TB-500 / GHK-Cu",
    specialty: "reparo",
    summary: "Evidência pré-clínica vs lacunas humanas.",
    parent_id: null,
    sort_order: 50,
  },
  {
    id: "a1000001-d007-4000-8000-000000000006",
    slug: "regulacao-anvisa-cfm",
    title: "Regulação ANVISA / CFM / WADA",
    specialty: "regulacao",
    summary: "Aprovado, off-label, manipulado, doping.",
    parent_id: null,
    sort_order: 60,
  },
  {
    id: "a1000001-d007-4000-8000-000000000007",
    slug: "composicao-corporal",
    title: "Composição corporal e performance",
    specialty: "performance",
    summary: "DEXA, proteína, treino de força no protocolo.",
    parent_id: null,
    sort_order: 70,
  },
  {
    id: "a1000001-d007-4000-8000-000000000008",
    slug: "demanda-consultorio",
    title: "Protocolo que gera demanda no consultório",
    specialty: "pratica",
    summary: "Oferta clara ao paciente a partir do domínio clínico.",
    parent_id: null,
    sort_order: 80,
  },
];

export const DOUTIVA_MASTERY_META_KEY = "doutiva_mastery";

export type MetaMasteryRow = {
  score: number;
  band: "green" | "yellow" | "red";
  confidence_avg: number;
  attempts: number;
  last_seen_at: string;
  updated_at: string;
};

export type MetaMasteryBlob = {
  version: 1;
  rows: Record<string, MetaMasteryRow>;
};

export function emptyMetaMastery(): MetaMasteryBlob {
  return { version: 1, rows: {} };
}

export function parseMetaMastery(raw: unknown): MetaMasteryBlob {
  if (!raw || typeof raw !== "object") return emptyMetaMastery();
  const obj = raw as { version?: number; rows?: Record<string, MetaMasteryRow> };
  if (obj.version !== 1 || !obj.rows || typeof obj.rows !== "object") {
    return emptyMetaMastery();
  }
  return { version: 1, rows: obj.rows };
}

/** PostgREST / schema-cache miss for a relation that is not migrated yet. */
export function isMissingRelationError(error: unknown): boolean {
  const e = error as { code?: string; message?: string; status?: number } | null;
  if (!e) return false;
  if (e.code === "PGRST205" || e.code === "PGRST202" || e.code === "42P01" || e.code === "42883") {
    return true;
  }
  const msg = String(e.message ?? "");
  return (
    /Could not find the (table|function)|relation .* does not exist|schema cache|does not exist/i.test(
      msg,
    ) ||
    /clinical_topics|mastery_by_topic|brain_sessions|lesson_topics|session_beat_awards|content_gaps|upsert_mastery_by_topic/i.test(
      msg,
    )
  );
}
