import { createServerFn } from "@tanstack/react-start";
import { FALLBACK_CASES, loadDailyCases, type DailyCase } from "@/lib/daily-case";
import {
  createTrialRateLimiter,
  gradeActiveTrialCase,
  resolveTrialTheme,
  selectTrialCases,
  toPublicTrialCase,
  TRIAL_CACHE_TTL_MS,
  TRIAL_CASE_COUNT,
  validateTrialGradeInput,
  type TopicMeta,
  type TrialCasePublic,
  type TrialCaseRecord,
  type TrialGradeResult,
} from "@/lib/trial-cases";

// TODO(Juliano): escolher os 3 casos de entrada
export const TRIAL_CASE_KEYS: readonly string[] = [];

type CachedTrialPool = {
  expiresAt: number;
  cases: TrialCaseRecord[];
};

let cachedTrialPool: CachedTrialPool | null = null;
const gradeRateLimiter = createTrialRateLimiter();

async function loadTopicMapReadOnly(
  lessonIds: string[],
): Promise<Map<string, TopicMeta[]>> {
  const map = new Map<string, TopicMeta[]>();
  if (lessonIds.length === 0) return map;

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          in: (col: string, vals: string[]) => PromiseLike<{ data: unknown[] | null; error: unknown }>;
        };
      };
    };

    const { data: links, error: linksError } = await db
      .from("lesson_topics")
      .select("lesson_id, topic_id")
      .in("lesson_id", lessonIds);

    if (linksError || !Array.isArray(links) || links.length === 0) return map;

    const rows = links as { lesson_id: string; topic_id: string }[];
    const topicIds = [...new Set(rows.map((r) => r.topic_id).filter(Boolean))];
    if (topicIds.length === 0) return map;

    const { data: topics, error: topicsError } = await db
      .from("clinical_topics")
      .select("id, title, specialty")
      .in("id", topicIds);

    if (topicsError || !Array.isArray(topics)) return map;

    const byId = new Map<string, TopicMeta>();
    for (const t of topics as TopicMeta[]) {
      if (t?.id && t?.title) byId.set(t.id, t);
    }

    for (const row of rows) {
      const topic = byId.get(row.topic_id);
      if (!topic) continue;
      const list = map.get(row.lesson_id) ?? [];
      list.push(topic);
      map.set(row.lesson_id, list);
    }
  } catch {
    // Tables clinical_topics / lesson_topics may not exist yet — fall back to theme inference.
  }

  return map;
}

async function loadActiveTrialCases(now = Date.now()): Promise<TrialCaseRecord[]> {
  if (cachedTrialPool && now < cachedTrialPool.expiresAt) {
    return cachedTrialPool.cases;
  }

  const { hasServiceRole } = await import("@/integrations/supabase/publishable.server");
  let pool: DailyCase[] = [];
  let topicMap = new Map<string, TopicMeta[]>();

  if (hasServiceRole()) {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { loadFullClinicalCase } = await import("@/lib/lesson-case-keys.server");

      const published = await loadDailyCases(supabaseAdmin as any);
      const dbOnly = published.filter((item) => !item.key.startsWith("static-"));

      const enriched: DailyCase[] = [];
      for (const item of dbOnly) {
        const full = await loadFullClinicalCase({
          id: item.key,
          position: 0,
          clinical_case: item.c,
          courses: { slug: item.courseSlug },
        });
        const candidate = full ?? item.c;
        if (candidate?.vignette && candidate.options.some((o) => o.correct)) {
          enriched.push({ ...item, c: candidate });
        }
      }

      if (enriched.length >= TRIAL_CASE_COUNT) {
        pool = enriched;
        topicMap = await loadTopicMapReadOnly(enriched.map((item) => item.key));
      }
    } catch (err) {
      console.error("loadActiveTrialCases DB read failed, using fallback", err);
    }
  }

  // Fallback only if fewer than 3 published DB cases with keys exist.
  if (pool.length < TRIAL_CASE_COUNT) {
    pool = FALLBACK_CASES;
  }

  const enrichedPool: TrialCaseRecord[] = pool.map((item) => {
    const resolved = resolveTrialTheme(item, topicMap.get(item.key) ?? []);
    return {
      ...item,
      ...resolved,
    };
  });

  const selected = selectTrialCases(enrichedPool, TRIAL_CASE_KEYS, TRIAL_CASE_COUNT);

  cachedTrialPool = {
    expiresAt: now + TRIAL_CACHE_TTL_MS,
    cases: selected,
  };

  return selected;
}

async function getCallerIp(): Promise<string> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const fwd = request?.headers?.get("x-forwarded-for") ?? "";
    return fwd.split(",")[0]?.trim() || request?.headers?.get("x-real-ip") || "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Public unauthenticated endpoint: returns 3 redacted clinical cases for the /medicos trial.
 * Strictly read-only — never writes to any database table and never leaks answer keys.
 */
export const getTrialCases = createServerFn({ method: "GET" }).handler(
  async (): Promise<TrialCasePublic[]> => {
    const active = await loadActiveTrialCases();
    return active.map(toPublicTrialCase);
  },
);

/**
 * Public unauthenticated endpoint: grades a single answer strictly against the 3 active trial cases.
 * Rate-limited to 30 gradings per IP per 10 minutes; zero DB writes.
 */
export const gradeTrialCase = createServerFn({ method: "POST" })
  .inputValidator((input: { caseKey: string; option: number }) => validateTrialGradeInput(input))
  .handler(async ({ data }): Promise<TrialGradeResult> => {
    const ip = await getCallerIp();
    if (!gradeRateLimiter.consume(ip)) {
      throw new Error("Muitas tentativas em sequência. Tente novamente em alguns minutos.");
    }
    const active = await loadActiveTrialCases();
    return gradeActiveTrialCase(active, data);
  });
