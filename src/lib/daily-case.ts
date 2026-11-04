import type { SupabaseClient } from "@supabase/supabase-js";
import { peptidesLessons, PEPTIDES_SLUG } from "@/content/peptides";
import { toCase, resolveRich } from "@/content/lesson-normalize";
import type { ClinicalCase } from "@/content/lesson-types";
import { toPublicClinicalCase, type PublicClinicalCase } from "@/lib/clinical-case-public";

export type DailyCase = {
  key: string;
  c: ClinicalCase;
  lessonTitle: string;
  courseTitle: string;
  courseSlug: string;
};

export type PublicDailyCase = {
  key: string;
  c: PublicClinicalCase;
  lessonTitle: string;
  courseTitle: string;
  courseSlug: string;
};

export const FALLBACK_CASES: DailyCase[] = Object.keys(peptidesLessons)
  .map(Number)
  .sort((a, b) => a - b)
  .map((p) => ({
    key: `static-${p}`,
    c: peptidesLessons[p].clinicalCase,
    lessonTitle: `Aula ${p}`,
    courseTitle: "Peptídeos em Medicina de Precisão",
    courseSlug: PEPTIDES_SLUG,
  }));

/** Calendar day in America/Sao_Paulo (aligned with award_daily_case). */
export function saoPauloDayKey(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Same case for everyone on the same civil day in America/Sao_Paulo. */
export function caseIndexForDate(d: Date, total: number) {
  if (total <= 0) return 0;
  const day = saoPauloDayKey(d);
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) >>> 0;
  return h % total;
}

/**
 * Load published cases.
 * Pass the user-scoped client for public payloads (keys already redacted in DB after 0014).
 * For grading, use loadDailyCasesForGrading() which merges lesson_case_keys via service_role.
 */
export async function loadDailyCases(client: SupabaseClient<any>): Promise<DailyCase[]> {
  const { data, error } = await client
    .from("lessons")
    .select("id, title, position, clinical_case, monograph, quick_ref, slides, courses!inner(slug, title, published)")
    .eq("status", "published")
    .order("id");
  if (error || !data) return FALLBACK_CASES;
  const out: DailyCase[] = [];
  for (const l of data as any[]) {
    const course = Array.isArray(l.courses) ? l.courses[0] : l.courses;
    if (!course?.published) continue;
    const fromDb = toCase(l.clinical_case);
    // Redacted public JSON has no correct flags — fall back to built-in rich content / keys.
    const c =
      (fromDb?.options.some((o) => o.correct) ? fromDb : null) ??
      resolveRich(l, course.slug)?.clinicalCase ??
      fromDb;
    if (!c?.vignette || c.options.length < 2) continue;
    out.push({
      key: String(l.id),
      c,
      lessonTitle: l.title,
      courseTitle: course.title,
      courseSlug: course.slug,
    });
  }
  return out.length ? out : FALLBACK_CASES;
}

/**
 * Server-only: full cases with answer keys for grading.
 * Pass the authenticated user client so RLS returns the same lesson set as getTodayCase
 * (anon/publishable without a JWT sees zero lessons and would fall back to static-* keys).
 */
export async function loadDailyCasesForGrading(
  userClient?: SupabaseClient<any>,
): Promise<DailyCase[]> {
  const { hasServiceRole } = await import("@/integrations/supabase/publishable.server");
  let client: SupabaseClient<any>;
  if (hasServiceRole()) {
    client = (await import("@/integrations/supabase/client.server")).supabaseAdmin as any;
  } else if (userClient) {
    client = userClient;
  } else {
    const { createPublishableServerClient } = await import(
      "@/integrations/supabase/publishable.server"
    );
    client = createPublishableServerClient();
  }
  const cases = await loadDailyCases(client as any);
  // loadDailyCases already merges resolveRich (peptides) when DB clinical_case is empty,
  // so answer keys are present for built-in content even without service_role.
  if (!hasServiceRole()) return cases;

  const { loadFullClinicalCase } = await import("@/lib/lesson-case-keys.server");
  const enriched: DailyCase[] = [];
  for (const item of cases) {
    if (item.key.startsWith("static-")) {
      enriched.push(item);
      continue;
    }
    const full = await loadFullClinicalCase({
      id: item.key,
      position: 0,
      clinical_case: item.c,
      courses: { slug: item.courseSlug },
    });
    enriched.push({ ...item, c: full ?? item.c });
  }
  return enriched;
}

export function toPublicDailyCase(d: DailyCase): PublicDailyCase {
  return {
    key: d.key,
    c: toPublicClinicalCase(d.c),
    lessonTitle: d.lessonTitle,
    courseTitle: d.courseTitle,
    courseSlug: d.courseSlug,
  };
}
