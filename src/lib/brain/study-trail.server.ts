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

type LessonRow = {
  id: string;
  title: string;
  course_id: string;
  module_title: string | null;
  status: string | null;
};

/** Soft map from clinical specialty/slug → course slug preferences. */
const SPECIALTY_COURSE_HINTS: Record<string, string[]> = {
  incretinas: [
    "tirzepatida-incretinas-consultorio",
    "obesidade-precisao-consultorio",
    "peptideos-medicina-de-precisao",
    "fertilidade-trt-incretinas",
    "cardiometabolico-prescritor-criterio",
  ],
  "eixo-gh": [
    "hormonios-implantes-criterio",
    "peptideos-medicina-de-precisao",
    "longevidade-medicina-evidencia",
  ],
  reparo: [
    "peptideos-medicina-de-precisao",
    "soroterapia-injetaveis-estereis",
    "manipulados-injetaveis-criterio",
  ],
  regulacao: [
    "etica-publicidade-prontuario",
    "manipulados-injetaveis-criterio",
    "peptideos-medicina-de-precisao",
  ],
  performance: [
    "sarcopenia-composicao-performance",
    "dexa-composicao-operacional",
    "peptideos-medicina-de-precisao",
  ],
  pratica: [
    "ia-pratica-medica",
    "precificacao-margem-consultorio",
    "tirzepatida-incretinas-consultorio",
    "gestao-clinica-uma-pagina",
  ],
};

/** Keyword bags to match lessons inside a course to a map topic. */
const TOPIC_LESSON_KEYWORDS: Record<string, RegExp> = {
  "incretinas-evidencia": /incretin|semaglut|tirzepat|STEP|SURMOUNT|SELECT|ensaio|GLP|GIP/i,
  "incretinas-seguranca": /segurança|seguranca|massa magra|efeito|adverso|GI|sarcopen/i,
  "incretinas-protocolo": /protocolo|consultório|consultorio|titula|indicação|indicacao|fenotip/i,
  "eixo-gh-secretagogos": /GH|secretagog|tesamorel|CJC|ipamorel|hormônio|hormon/i,
  "reparo-bpc-tb500": /BPC|TB-500|GHK|reparo|hype|tecid/i,
  "regulacao-anvisa-cfm": /regula|ANVISA|CFM|WADA|ética|etica|prontuário|prontuario|evidência|evidencia/i,
  "composicao-corporal": /composi|DEXA|sarcopen|performance|massa|proteína|proteina|treino/i,
  "demanda-consultorio": /consultório|consultorio|demanda|prática|pratica|negócio|negocio|casos clínicos|proposta|valor|IA /i,
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
  if (hintIdx >= 0) score += 50 - hintIdx * 6;

  if (specialty && hay.includes(specialty.slice(0, Math.min(6, specialty.length)))) score += 12;
  if (slug.includes("incretin") && /incretin|semaglut|tirzepat|glp|obesidade|emagrec|metabol/.test(hay)) {
    score += 20;
  }
  if (slug.includes("gh") && /gh|secretagog|tesamorel|peptid|hormon/.test(hay)) score += 16;
  if (slug.includes("reparo") && /bpc|tb-500|reparo|peptid|soroterapia|manipulado/.test(hay)) {
    score += 16;
  }
  if (slug.includes("regula") && /ética|etica|cfm|anvisa|prontuário|prontuario|manipulado/.test(hay)) {
    score += 16;
  }
  if (slug.includes("composicao") || specialty === "performance") {
    if (/composi|dexa|sarcopen|performance|massa/.test(hay)) score += 16;
  }
  if (specialty === "pratica" && /prática|pratica|ia |negócio|negocio|precific|gestão|gestao/.test(hay)) {
    score += 12;
  }
  // Thin-catalog fallback: peptides is a reasonable clinical anchor.
  if (course.slug === "peptideos-medicina-de-precisao") score += 4;

  return score;
}

function lessonMatchScore(lesson: LessonRow, row: MasteryRow): number {
  const slug = row.topic?.slug ?? "";
  const re = TOPIC_LESSON_KEYWORDS[slug];
  const hay = `${lesson.title} ${lesson.module_title ?? ""}`;
  let score = 0;
  if (re?.test(hay)) score += 30;
  const specialty = (row.topic?.specialty ?? "").toLowerCase();
  if (specialty && hay.toLowerCase().includes(specialty.slice(0, 5))) score += 8;
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

async function loadPublishedLessons(
  supabase: SupabaseClient<any>,
  courseIds: string[],
): Promise<LessonRow[]> {
  if (!courseIds.length) return [];
  const { data, error } = await supabase
    .from("lessons")
    .select("id, title, course_id, module_title, status")
    .in("course_id", courseIds)
    .eq("status", "published")
    .limit(400);
  if (error) return [];
  return (data as LessonRow[] | null) ?? [];
}

/** Build the physician's ordered study trail from the mastery map. */
export async function buildStudyTrail(
  supabase: SupabaseClient<any>,
  userId: string,
  limit = 8,
  accessToken?: string,
): Promise<StudyTrail> {
  const map = await getMastery(supabase, userId, accessToken).catch(() => null);
  const { courses, accessOf } = await loadPublishedCourses(supabase, userId);
  const lessons = await loadPublishedLessons(
    supabase,
    courses.map((c) => c.id),
  );
  const lessonsByCourse = new Map<string, LessonRow[]>();
  for (const l of lessons) {
    const arr = lessonsByCourse.get(l.course_id) ?? [];
    arr.push(l);
    lessonsByCourse.set(l.course_id, arr);
  }

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
    ? await nextSessionTopics(supabase, userId, Math.max(limit, 6), accessToken)
    : map.mastery.slice(0, Math.min(4, map.mastery.length));

  const topicIds = focus.map((f) => f.topic_id);
  const lessonByTopic = new Map<string, { id: string; title: string; course_id: string }>();

  if (topicIds.length) {
    const { data: links, error: linkErr } = await supabase
      .from("lesson_topics")
      .select("topic_id, lesson_id, lessons!inner(id, title, course_id, status)")
      .in("topic_id", topicIds)
      .eq("lessons.status", "published")
      .limit(80);

    // Missing lesson_topics (pre-0027) → specialty/keyword course matching below.
    if (!linkErr) {
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
  }

  // Prefer unique lessons; courses may repeat when the catalog is thin.
  const usedLessons = new Set<string>();
  const usedCourseOnce = new Set<string>();
  const steps: StudyTrailStep[] = [];

  for (const row of focus) {
    if (steps.length >= limit) break;
    const untouched = row.attempts === 0;
    const band: MasteryBand | "untouched" = untouched ? "untouched" : row.band;
    const linked = lessonByTopic.get(row.topic_id);

    let course: StudyTrailCourse | null = null;
    let lesson: { id: string; title: string } | null = null;

    if (linked && !usedLessons.has(linked.id)) {
      const match = courses.find((c) => c.id === linked.course_id);
      if (match) {
        course = accessOf(match.slug);
        lesson = { id: linked.id, title: linked.title };
        usedLessons.add(linked.id);
        usedCourseOnce.add(match.slug);
      }
    }

    if (!course) {
      const ranked = [...courses]
        .map((c) => {
          // Prefer unused courses slightly, but still allow reuse.
          const base = courseMatchScore(c, row);
          const reusePenalty = usedCourseOnce.has(c.slug) ? 8 : 0;
          return { c, score: base - reusePenalty };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);

      for (const pick of ranked) {
        const pool = lessonsByCourse.get(pick.c.id) ?? [];
        const rankedLessons = pool
          .filter((l) => !usedLessons.has(l.id))
          .map((l) => ({ l, score: lessonMatchScore(l, row) }))
          .sort((a, b) => b.score - a.score);
        const bestLesson = rankedLessons[0]?.score
          ? rankedLessons[0].l
          : pool.find((l) => !usedLessons.has(l.id)) ?? null;

        course = accessOf(pick.c.slug);
        if (bestLesson) {
          lesson = { id: bestLesson.id, title: bestLesson.title };
          usedLessons.add(bestLesson.id);
        }
        usedCourseOnce.add(pick.c.slug);
        break;
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
