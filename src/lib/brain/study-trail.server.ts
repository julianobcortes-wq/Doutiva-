/**
 * Minha Trilha — fila de estudo pessoal derivada do Mapa clínico.
 * Universidade continua o catálogo completo; esta superfície é só o buraco do mapa.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getMastery, nextSessionTopics } from "@/lib/brain/brain.server";
import type {
  MasteryBand,
  MasteryRow,
  StudyTrail,
  StudyTrailCourse,
  StudyTrailStep,
} from "@/lib/brain/types";
import { accessForCourse, isFreeCourseSlug } from "@/lib/freemium";

export type { StudyTrail, StudyTrailCourse, StudyTrailStep };

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
};

/** Soft map from clinical specialty/slug → course slug preferences. */
const SPECIALTY_COURSE_HINTS: Record<string, string[]> = {
  incretinas: [
    "tirzepatida-incretinas-consultorio",
    "obesidade-precisao-consultorio",
    "fertilidade-trt-incretinas",
    "cardiometabolico-prescritor-criterio",
  ],
  "eixo-gh": ["peptideos-medicina-de-precisao", "hormonios-implantes-criterio"],
  reparo: ["peptideos-medicina-de-precisao", "soroterapia-injetaveis-estereis"],
  regulacao: ["etica-publicidade-prontuario", "manipulados-injetaveis-criterio"],
  performance: ["sarcopenia-composicao-performance", "dexa-composicao-operacional"],
  pratica: ["ia-pratica-medica", "precificacao-margem-consultorio"],
};

function bandLabel(band: MasteryBand | "untouched"): string {
  if (band === "red") return "Lacuna";
  if (band === "yellow") return "Parcial";
  if (band === "green") return "Reforço";
  return "Ainda não calibrado";
}

function reasonFor(row: MasteryRow): string {
  const untouched = row.attempts === 0;
  const band = untouched ? "untouched" : row.band;
  const topic = row.topic?.title ?? "tema do mapa";
  return `${bandLabel(band)} · ${topic}`;
}

function courseMatchScore(course: CourseRow, row: MasteryRow): number {
  const specialty = (row.topic?.specialty ?? "").toLowerCase();
  const slug = (row.topic?.slug ?? "").toLowerCase();
  const hay = `${course.slug} ${course.title} ${course.subtitle ?? ""} ${course.category ?? ""}`.toLowerCase();
  let score = 0;

  const hints = SPECIALTY_COURSE_HINTS[specialty] ?? [];
  const hintIdx = hints.indexOf(course.slug);
  if (hintIdx >= 0) score += 40 - hintIdx * 5;

  if (specialty && hay.includes(specialty.slice(0, Math.min(6, specialty.length)))) score += 12;
  if (slug.includes("incretin") && /incretin|semaglut|tirzepat|glp|obesidade|emagrec/.test(hay)) score += 20;
  if (slug.includes("gh") && /gh|secretagog|tesamorel|peptid/.test(hay)) score += 16;
  if (slug.includes("reparo") && /bpc|tb-500|reparo|peptid|soroterapia/.test(hay)) score += 16;
  if (slug.includes("regula") && /ética|etica|cfm|anvisa|prontuário|prontuario|manipulado/.test(hay)) score += 16;
  if (slug.includes("composicao") || specialty === "performance") {
    if (/composi|dexa|sarcopen|performance|massa/.test(hay)) score += 16;
  }
  if (specialty === "pratica" && /prática|pratica|ia |negócio|negocio|precific/.test(hay)) score += 12;

  return score;
}

async function loadPublishedCourses(
  supabase: SupabaseClient<any>,
  userId: string,
): Promise<{ courses: CourseRow[]; accessOf: (slug: string) => StudyTrailCourse }> {
  const { data } = await supabase
    .from("courses")
    .select("id, slug, title, subtitle, category")
    .eq("published", true)
    .order("featured", { ascending: false });

  const courses = (data as CourseRow[] | null) ?? [];
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();
  const status = (sub?.status as string | undefined) ?? null;

  const accessOf = (slug: string): StudyTrailCourse => {
    const c = courses.find((x) => x.slug === slug);
    if (!c) {
      return {
        id: "",
        slug,
        title: slug,
        subtitle: null,
        category: null,
        free: isFreeCourseSlug(slug),
        access: accessForCourse(slug, status),
      };
    }
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      category: c.category,
      free: isFreeCourseSlug(c.slug),
      access: accessForCourse(c.slug, status),
    };
  };

  return { courses, accessOf };
}

/** Build the physician's ordered study trail from the mastery map. */
export async function buildStudyTrail(
  supabase: SupabaseClient<any>,
  userId: string,
  limit = 8,
): Promise<StudyTrail> {
  const map = await getMastery(supabase, userId).catch(() => null);
  const { courses, accessOf } = await loadPublishedCourses(supabase, userId);

  if (!map) {
    return {
      mapReady: false,
      counts: { green: 0, yellow: 0, red: 0, untouched: 0 },
      steps: [],
      focusTopicCount: 0,
      catalogCount: courses.length,
    };
  }

  const focus = map.ready
    ? await nextSessionTopics(supabase, userId, Math.max(limit, 6))
    : map.mastery.slice(0, Math.min(4, map.mastery.length));

  const topicIds = focus.map((f) => f.topic_id);
  const lessonByTopic = new Map<string, { id: string; title: string; course_id: string }>();

  if (topicIds.length) {
    const { data: links } = await supabase
      .from("lesson_topics")
      .select("topic_id, lesson_id, lessons!inner(id, title, course_id, status)")
      .in("topic_id", topicIds)
      .eq("lessons.status", "published")
      .limit(80);

    for (const row of (links as any[] | null) ?? []) {
      const lesson = row.lessons;
      if (!lesson?.id || lessonByTopic.has(row.topic_id)) continue;
      lessonByTopic.set(row.topic_id, {
        id: lesson.id,
        title: lesson.title,
        course_id: lesson.course_id,
      });
    }
  }

  const usedCourses = new Set<string>();
  const steps: StudyTrailStep[] = [];

  for (const row of focus) {
    if (steps.length >= limit) break;
    const untouched = row.attempts === 0;
    const band: MasteryBand | "untouched" = untouched ? "untouched" : row.band;
    const linked = lessonByTopic.get(row.topic_id);

    let course: StudyTrailCourse | null = null;
    let lesson: { id: string; title: string } | null = null;

    if (linked) {
      const match = courses.find((c) => c.id === linked.course_id);
      if (match && !usedCourses.has(match.slug)) {
        course = accessOf(match.slug);
        lesson = { id: linked.id, title: linked.title };
        usedCourses.add(match.slug);
      }
    }

    if (!course) {
      const ranked = [...courses]
        .map((c) => ({ c, score: courseMatchScore(c, row) }))
        .filter((x) => x.score > 0 && !usedCourses.has(x.c.slug))
        .sort((a, b) => b.score - a.score);
      if (ranked[0]) {
        course = accessOf(ranked[0].c.slug);
        usedCourses.add(ranked[0].c.slug);
      }
    }

    steps.push({
      rank: steps.length + 1,
      band,
      score: row.score,
      attempts: row.attempts,
      reason: reasonFor(row),
      topic: {
        id: row.topic_id,
        slug: row.topic?.slug ?? "",
        title: row.topic?.title ?? "Tema",
        specialty: row.topic?.specialty ?? "",
        summary: row.topic?.summary ?? null,
      },
      course,
      lesson,
    });
  }

  return {
    mapReady: map.ready,
    counts: map.counts,
    steps,
    focusTopicCount: focus.length,
    catalogCount: courses.length,
  };
}
