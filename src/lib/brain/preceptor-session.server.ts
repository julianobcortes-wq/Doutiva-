/**
 * Preceptor — escolhe a próxima sessão / Caso do Dia a partir do mapa.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  caseIndexForDate,
  loadDailyCases,
  type DailyCase,
} from "@/lib/daily-case";
import { getMastery, nextSessionTopics } from "@/lib/brain/brain.server";
import type { ConfidenceLabel, MasteryMap } from "@/lib/brain/types";

export type PersonalCasePick = {
  daily: DailyCase;
  source: "map" | "calendar";
  topicIds: string[];
  mapReady: boolean;
};

/** Pick today's case: prefer lessons linked to red/yellow topics. */
export async function pickPersonalDailyCase(
  supabase: SupabaseClient<any>,
  userId: string,
): Promise<PersonalCasePick> {
  const cases = await loadDailyCases(supabase);
  const map = await getMastery(supabase, userId).catch(() => null);
  const mapReady = !!map?.ready;

  if (!map || !mapReady || cases.length === 0) {
    return {
      daily: cases[caseIndexForDate(new Date(), cases.length)] ?? cases[0],
      source: "calendar",
      topicIds: [],
      mapReady: false,
    };
  }

  const focus = await nextSessionTopics(supabase, userId, 5);
  const focusIds = new Set(focus.map((f) => f.topic_id));

  const { data: links } = await supabase
    .from("lesson_topics")
    .select("lesson_id, topic_id")
    .in(
      "topic_id",
      focus.map((f) => f.topic_id),
    );

  const lessonScore = new Map<string, number>();
  for (const row of (links as { lesson_id: string; topic_id: string }[] | null) ?? []) {
    if (!focusIds.has(row.topic_id)) continue;
    const rank = focus.findIndex((f) => f.topic_id === row.topic_id);
    const boost = rank < 0 ? 1 : 10 - rank;
    lessonScore.set(row.lesson_id, (lessonScore.get(row.lesson_id) ?? 0) + boost);
  }

  // Also soft-match by specialty keywords in titles when links are sparse.
  for (const c of cases) {
    if (c.key.startsWith("static-")) continue;
    for (const f of focus) {
      const spec = f.topic?.specialty ?? "";
      const slug = f.topic?.slug ?? "";
      const hay = `${c.lessonTitle} ${c.courseTitle}`.toLowerCase();
      if (
        (spec && hay.includes(spec.slice(0, 6).toLowerCase())) ||
        (slug.includes("incretin") && /incretin|semaglut|tirzepat|glp/.test(hay)) ||
        (slug.includes("reparo") && /bpc|tb-500|reparo/.test(hay)) ||
        (slug.includes("gh") && /\bgh\b|secretagog|tesamorel/.test(hay)) ||
        (slug.includes("regula") && /regula|anvisa|cfm|wada|ética/.test(hay))
      ) {
        lessonScore.set(c.key, (lessonScore.get(c.key) ?? 0) + 3);
      }
    }
  }

  const ranked = [...cases].sort((a, b) => {
    const sa = lessonScore.get(a.key) ?? 0;
    const sb = lessonScore.get(b.key) ?? 0;
    if (sb !== sa) return sb - sa;
    return a.key.localeCompare(b.key);
  });

  const day = caseIndexForDate(new Date(), Math.max(3, ranked.length));
  // Stable personal rotation among top map matches
  const pool = ranked.filter((c) => (lessonScore.get(c.key) ?? 0) > 0);
  const chosen =
    pool.length > 0 ? pool[day % pool.length] : ranked[day % ranked.length];

  return {
    daily: chosen,
    source: pool.length > 0 ? "map" : "calendar",
    topicIds: focus.map((f) => f.topic_id),
    mapReady,
  };
}

/** After a personal case, blend mastery for linked topics. */
export async function recordCaseOutcome(input: {
  userId: string;
  caseKey: string;
  correct: boolean;
  confidence?: ConfidenceLabel;
  topicIds?: string[];
  supabase: SupabaseClient<any>;
}) {
  const { updateMastery } = await import("@/lib/brain/brain.server");
  const conf =
    input.confidence === "sei" ? 0.9 : input.confidence === "acho" ? 0.55 : input.confidence === "nao_sei" ? 0.2 : 0.5;
  const base = input.correct ? (input.confidence === "sei" ? 82 : input.confidence === "acho" ? 68 : 55) : input.confidence === "sei" ? 35 : 25;

  let topicIds = input.topicIds ?? [];
  if (!topicIds.length && !input.caseKey.startsWith("static-")) {
    const { data } = await input.supabase
      .from("lesson_topics")
      .select("topic_id")
      .eq("lesson_id", input.caseKey);
    topicIds = ((data as { topic_id: string }[] | null) ?? []).map((r) => r.topic_id);
  }

  for (const topicId of topicIds.slice(0, 3)) {
    await updateMastery({
      userId: input.userId,
      topicId,
      score: base,
      confidence: conf,
      evidence: {
        source: "preceptor_daily_case",
        case_key: input.caseKey,
        correct: input.correct,
        confidence: input.confidence ?? null,
      },
    });
  }

  return { updated: topicIds.length };
}

export async function mapBrief(supabase: SupabaseClient<any>, userId: string): Promise<MasteryMap | null> {
  try {
    return await getMastery(supabase, userId);
  } catch {
    return null;
  }
}
