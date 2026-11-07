/**
 * Cérebro Doutiva — orquestrador AI-first.
 * Todas as faces (Cartógrafo, Preceptor, Bibliotecário, Estúdio, Matchmaker)
 * passam por estas tools para memória e decisão compartilhadas.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  bandFromScore,
  type ClinicalTopic,
  type MasteryBand,
  type MasteryMap,
  type MasteryRow,
} from "@/lib/brain/types";

type Client = SupabaseClient<Database>;

function asTopics(rows: unknown): ClinicalTopic[] {
  return (rows as ClinicalTopic[] | null) ?? [];
}

/** List active clinical topics (catalog for the map). */
export async function getTopics(supabase: Client): Promise<ClinicalTopic[]> {
  const { data, error } = await supabase
    .from("clinical_topics" as never)
    .select("id, slug, title, specialty, summary, parent_id, sort_order")
    .eq("active", true)
    .order("sort_order");
  if (error) throw error;
  return asTopics(data);
}

/** Full mastery map for a physician. */
export async function getMastery(
  supabase: Client,
  userId: string,
): Promise<MasteryMap> {
  const topics = await getTopics(supabase);
  const { data, error } = await supabase
    .from("mastery_by_topic" as never)
    .select("topic_id, score, band, confidence_avg, attempts, last_seen_at, updated_at")
    .eq("user_id", userId);
  if (error) throw error;

  const byTopic = new Map(
    ((data as MasteryRow[] | null) ?? []).map((r) => [r.topic_id, r]),
  );

  const mastery: MasteryRow[] = topics.map((t) => {
    const row = byTopic.get(t.id);
    if (!row) {
      return {
        topic_id: t.id,
        score: 0,
        band: "red" as MasteryBand,
        confidence_avg: 0,
        attempts: 0,
        last_seen_at: "",
        updated_at: "",
        topic: t,
      };
    }
    return { ...row, topic: t };
  });

  const touched = mastery.filter((m) => m.attempts > 0);
  const counts = {
    green: touched.filter((m) => m.band === "green").length,
    yellow: touched.filter((m) => m.band === "yellow").length,
    red: touched.filter((m) => m.band === "red").length,
    untouched: mastery.filter((m) => m.attempts === 0).length,
  };

  return {
    topics,
    mastery,
    counts,
    ready: touched.length >= Math.min(6, topics.length),
  };
}

/** Persist / blend a topic assessment (service role preferred). */
export async function updateMastery(input: {
  userId: string;
  topicId: string;
  score: number;
  confidence: number;
  evidence?: Record<string, unknown>;
}): Promise<MasteryRow | null> {
  const score = Math.max(0, Math.min(100, Math.round(input.score)));
  const confidence = Math.max(0, Math.min(1, input.confidence));

  try {
    const { hasServiceRole } = await import("@/integrations/supabase/publishable.server");
    if (hasServiceRole()) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin.rpc("upsert_mastery_by_topic" as never, {
        _user_id: input.userId,
        _topic_id: input.topicId,
        _score: score,
        _confidence: confidence,
        _evidence: input.evidence ?? {},
      } as never);
      if (error) {
        console.error("upsert_mastery_by_topic", error);
        return null;
      }
      const row = data as MasteryRow;
      return { ...row, band: (row.band as MasteryBand) ?? bandFromScore(score, confidence) };
    }
  } catch (e) {
    console.error("updateMastery service_role unavailable", e);
  }

  // Soft fallback: client cannot write mastery_by_topic under RLS — return computed only.
  return {
    topic_id: input.topicId,
    score,
    band: bandFromScore(score, confidence),
    confidence_avg: confidence,
    attempts: 1,
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/** Next topics the Preceptor should attack (red → yellow, least attempts first). */
export async function nextSessionTopics(
  supabase: Client,
  userId: string,
  limit = 3,
): Promise<MasteryRow[]> {
  const map = await getMastery(supabase, userId);
  const ranked = [...map.mastery].sort((a, b) => {
    const bandRank = (band: MasteryBand) =>
      band === "red" ? 0 : band === "yellow" ? 1 : 2;
    const br = bandRank(a.band) - bandRank(b.band);
    if (br !== 0) return br;
    if (a.score !== b.score) return a.score - b.score;
    return a.attempts - b.attempts;
  });
  return ranked.slice(0, limit);
}

export async function saveBrainSession(input: {
  supabase: Client;
  userId: string;
  face: string;
  sessionId?: string;
  transcript?: unknown[];
  result?: Record<string, unknown>;
  status?: "active" | "completed" | "abandoned";
}): Promise<string | null> {
  const payload = {
    user_id: input.userId,
    face: input.face,
    status: input.status ?? "active",
    transcript: input.transcript ?? [],
    result: input.result ?? {},
    updated_at: new Date().toISOString(),
  };

  if (input.sessionId) {
    const { error } = await input.supabase
      .from("brain_sessions" as never)
      .update(payload as never)
      .eq("id", input.sessionId)
      .eq("user_id", input.userId);
    if (error) {
      console.error("brain_sessions update", error);
      return input.sessionId;
    }
    return input.sessionId;
  }

  const { data, error } = await input.supabase
    .from("brain_sessions" as never)
    .insert(payload as never)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("brain_sessions insert", error);
    return null;
  }
  return (data as { id: string } | null)?.id ?? null;
}
