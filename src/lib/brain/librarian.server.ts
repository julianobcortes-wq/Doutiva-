/**
 * Bibliotecário — recupera o que já existe no corpus Doutiva.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type CorpusHit = {
  kind: "lesson" | "source" | "case";
  id: string;
  title: string;
  score: number;
  snippet?: string;
};

/** Search lessons + knowledge_sources for a clinical need. */
export async function retrieveCorpus(
  supabase: SupabaseClient<any>,
  query: string,
  limit = 8,
): Promise<CorpusHit[]> {
  const q = query.trim().slice(0, 200);
  if (q.length < 2) return [];

  const hits: CorpusHit[] = [];

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, description, module_title, status")
    .eq("status", "published")
    .or(`title.ilike.%${q}%,description.ilike.%${q}%,module_title.ilike.%${q}%`)
    .limit(limit);

  for (const l of lessons ?? []) {
    hits.push({
      kind: "lesson",
      id: l.id,
      title: l.title,
      score: 0.8,
      snippet: l.module_title ?? l.description ?? undefined,
    });
  }

  try {
    const { data: sources } = await supabase.rpc("search_sources", {
      _q: q,
      _limit: limit,
    });
    for (const s of (sources as { title?: string; excerpt?: string; url?: string }[] | null) ?? []) {
      hits.push({
        kind: "source",
        id: s.url || s.title || crypto.randomUUID(),
        title: s.title || "Fonte",
        score: 0.7,
        snippet: s.excerpt?.slice(0, 180),
      });
    }
  } catch {
    /* search_sources may be absent in some envs */
  }

  // Topic-linked lessons
  const { data: topics } = await supabase
    .from("clinical_topics")
    .select("id, title, slug")
    .or(`title.ilike.%${q}%,slug.ilike.%${q}%,summary.ilike.%${q}%`)
    .limit(5);
  if (topics?.length) {
    const { data: links } = await supabase
      .from("lesson_topics")
      .select("lesson_id, topic_id, lessons(id, title, status)")
      .in(
        "topic_id",
        topics.map((t: { id: string }) => t.id),
      )
      .limit(limit);
    for (const row of links ?? []) {
      const lesson = (row as any).lessons;
      if (!lesson || lesson.status !== "published") continue;
      hits.push({
        kind: "lesson",
        id: lesson.id,
        title: lesson.title,
        score: 0.9,
        snippet: "Ligado ao mapa clínico",
      });
    }
  }

  // Dedupe by id
  const seen = new Set<string>();
  return hits
    .filter((h) => {
      if (seen.has(h.id)) return false;
      seen.add(h.id);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** True when corpus already covers the topic well enough to reuse. */
export async function topicHasPublishedLesson(
  supabase: SupabaseClient<any>,
  topicId: string,
): Promise<{ has: boolean; lessonIds: string[] }> {
  const { data } = await supabase
    .from("lesson_topics")
    .select("lesson_id, lessons!inner(id, status)")
    .eq("topic_id", topicId)
    .eq("lessons.status", "published");
  const lessonIds = ((data as { lesson_id: string }[] | null) ?? []).map((r) => r.lesson_id);
  return { has: lessonIds.length > 0, lessonIds };
}
