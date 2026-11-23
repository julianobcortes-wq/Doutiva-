/**
 * Cérebro Doutiva — orquestrador AI-first.
 * Todas as faces (Cartógrafo, Preceptor, Bibliotecário, Estúdio, Matchmaker)
 * passam por estas tools para memória e decisão compartilhadas.
 *
 * Launch resilience: if brain tables (0026+) are missing on Supabase, fall back to
 * the built-in topic catalog + Auth user_metadata mastery blob so interview→trail
 * still works on production.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  DEFAULT_CLINICAL_TOPICS,
  DOUTIVA_MASTERY_META_KEY,
  emptyMetaMastery,
  isMissingRelationError,
  parseMetaMastery,
  type MetaMasteryBlob,
  type MetaMasteryRow,
} from "@/lib/brain/catalog";
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

function buildMapFromRows(
  topics: ClinicalTopic[],
  byTopic: Map<string, Omit<MasteryRow, "topic">>,
): MasteryMap {
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
    ready: touched.length >= Math.min(3, Math.max(1, topics.length)),
  };
}

async function readMetaMastery(supabase: Client): Promise<MetaMasteryBlob> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return emptyMetaMastery();
  return parseMetaMastery(data.user.user_metadata?.[DOUTIVA_MASTERY_META_KEY]);
}

async function writeMetaMastery(
  supabase: Client,
  blob: MetaMasteryBlob,
): Promise<boolean> {
  const { error } = await supabase.auth.updateUser({
    data: { [DOUTIVA_MASTERY_META_KEY]: blob },
  });
  if (error) {
    console.error("doutiva_mastery metadata write", error.message);
    return false;
  }
  return true;
}

function blendMetaRow(
  prev: MetaMasteryRow | undefined,
  score: number,
  confidence: number,
): MetaMasteryRow {
  const now = new Date().toISOString();
  if (!prev || prev.attempts === 0) {
    return {
      score,
      band: bandFromScore(score, confidence),
      confidence_avg: confidence,
      attempts: 1,
      last_seen_at: now,
      updated_at: now,
    };
  }
  const blended = Math.round(prev.score * 0.55 + score * 0.45);
  const conf = Math.round((Number(prev.confidence_avg) * 0.55 + confidence * 0.45) * 100) / 100;
  return {
    score: Math.max(0, Math.min(100, blended)),
    band: bandFromScore(blended, conf),
    confidence_avg: conf,
    attempts: prev.attempts + 1,
    last_seen_at: now,
    updated_at: now,
  };
}

/** List active clinical topics (catalog for the map). */
export async function getTopics(supabase: Client): Promise<ClinicalTopic[]> {
  try {
    const { data, error } = await supabase
      .from("clinical_topics" as never)
      .select("id, slug, title, specialty, summary, parent_id, sort_order")
      .eq("active", true)
      .order("sort_order");
    if (error) {
      if (isMissingRelationError(error)) return DEFAULT_CLINICAL_TOPICS;
      throw error;
    }
    const topics = asTopics(data);
    return topics.length ? topics : DEFAULT_CLINICAL_TOPICS;
  } catch (e) {
    if (isMissingRelationError(e)) return DEFAULT_CLINICAL_TOPICS;
    throw e;
  }
}

/** Full mastery map for a physician. */
export async function getMastery(
  supabase: Client,
  userId: string,
): Promise<MasteryMap> {
  const topics = await getTopics(supabase);

  try {
    const { data, error } = await supabase
      .from("mastery_by_topic" as never)
      .select("topic_id, score, band, confidence_avg, attempts, last_seen_at, updated_at")
      .eq("user_id", userId);
    if (error) {
      if (!isMissingRelationError(error)) throw error;
      // Table missing → Auth metadata fallback below.
    } else {
      const byTopic = new Map(
        ((data as MasteryRow[] | null) ?? []).map((r) => [r.topic_id, r]),
      );
      return buildMapFromRows(topics, byTopic);
    }
  } catch (e) {
    if (!isMissingRelationError(e)) throw e;
  }

  const meta = await readMetaMastery(supabase);
  const byTopic = new Map<string, Omit<MasteryRow, "topic">>();
  for (const [topicId, row] of Object.entries(meta.rows)) {
    byTopic.set(topicId, {
      topic_id: topicId,
      score: row.score,
      band: row.band,
      confidence_avg: row.confidence_avg,
      attempts: row.attempts,
      last_seen_at: row.last_seen_at,
      updated_at: row.updated_at,
    });
  }
  return buildMapFromRows(topics, byTopic);
}

/** Persist / blend a topic assessment (DB RPC preferred; metadata fallback). */
export async function updateMastery(input: {
  userId: string;
  topicId: string;
  score: number;
  confidence: number;
  evidence?: Record<string, unknown>;
  /** User-scoped client — required for Auth metadata fallback. */
  supabase?: Client;
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
      if (!error && data) {
        const row = data as MasteryRow;
        return { ...row, band: (row.band as MasteryBand) ?? bandFromScore(score, confidence) };
      }
      if (error && !isMissingRelationError(error)) {
        console.error("upsert_mastery_by_topic", error);
      }
    }
  } catch (e) {
    if (!isMissingRelationError(e)) {
      console.error("updateMastery service_role path", e);
    }
  }

  // Fallback: Auth user_metadata blob (works without brain tables / service role).
  if (input.supabase) {
    const blob = await readMetaMastery(input.supabase);
    const next = blendMetaRow(blob.rows[input.topicId], score, confidence);
    blob.rows[input.topicId] = next;
    await writeMetaMastery(input.supabase, blob);
    return {
      topic_id: input.topicId,
      score: next.score,
      band: next.band,
      confidence_avg: next.confidence_avg,
      attempts: next.attempts,
      last_seen_at: next.last_seen_at,
      updated_at: next.updated_at,
    };
  }

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

  try {
    if (input.sessionId) {
      const { error } = await input.supabase
        .from("brain_sessions" as never)
        .update(payload as never)
        .eq("id", input.sessionId)
        .eq("user_id", input.userId);
      if (error) {
        if (!isMissingRelationError(error)) console.error("brain_sessions update", error);
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
      if (!isMissingRelationError(error)) console.error("brain_sessions insert", error);
      // Ephemeral id so the client can keep threading turns without a table.
      return input.sessionId ?? crypto.randomUUID();
    }
    return (data as { id: string } | null)?.id ?? crypto.randomUUID();
  } catch (e) {
    if (!isMissingRelationError(e)) console.error("brain_sessions", e);
    return input.sessionId ?? crypto.randomUUID();
  }
}
