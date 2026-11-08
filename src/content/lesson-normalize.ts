import type { ClinicalCase, RichLesson, Slide } from "./lesson-types";
import { getRichLesson } from "./peptides";

const str = (v: unknown) => (typeof v === "string" ? v : "");
const arr = <T = unknown>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Loose DB/AI slide shape → typed Slide (drops anything unusable). */
export function toSlide(raw: unknown): Slide | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = str(r.title);
  switch (r.kind) {
    case "title":
      return {
        kind: "title",
        title,
        eyebrow: str(r.eyebrow) || undefined,
        subtitle: str(r.subtitle) || undefined,
        image: str(r.image) || undefined,
        imageAlt: str(r.imageAlt) || undefined,
      };
    case "bullets":
      return {
        kind: "bullets",
        title,
        bullets: arr<string>(r.bullets).map(String),
        note: str(r.note) || undefined,
        image: str(r.image) || undefined,
        imageAlt: str(r.imageAlt) || undefined,
      };
    case "bars":
      return {
        kind: "bars",
        title,
        unit: str(r.unit),
        source: str(r.source),
        note: str(r.note) || undefined,
        bars: arr<Record<string, unknown>>(r.bars).map((b) => ({
          label: str(b.label),
          value: Number(b.value) || 0,
          highlight: !!b.highlight,
        })),
      };
    case "flow":
      return {
        kind: "flow",
        title,
        note: str(r.note) || undefined,
        steps: arr<Record<string, unknown>>(r.steps).map((s) => ({
          label: str(s.label),
          detail: str(s.detail) || undefined,
        })),
      };
    case "table":
      return {
        kind: "table",
        title,
        head: arr<string>(r.head).map(String),
        rows: arr<unknown[]>(r.rows).map((row) => arr(row).map(String)),
        source: str(r.source) || undefined,
      };
    case "split": {
      const l = (r.left ?? {}) as Record<string, unknown>,
        rt = (r.right ?? {}) as Record<string, unknown>;
      return {
        kind: "split",
        title,
        left: { label: str(l.label), items: arr<string>(l.items).map(String) },
        right: { label: str(rt.label), items: arr<string>(rt.items).map(String) },
      };
    }
    case "pearl":
      return { kind: "pearl", title, text: str(r.text), source: str(r.source) || undefined };
    case "figure": {
      const image = str(r.image);
      if (!image) return null;
      return {
        kind: "figure",
        title,
        caption: str(r.caption) || undefined,
        image,
        imageAlt: str(r.imageAlt) || undefined,
        credit: str(r.credit) || undefined,
      };
    }
    case "media": {
      const image = str(r.image);
      if (!image) return null;
      const side = str(r.imageSide) === "left" ? "left" : "right";
      return {
        kind: "media",
        title,
        eyebrow: str(r.eyebrow) || undefined,
        body: str(r.body) || undefined,
        bullets: arr<string>(r.bullets).map(String),
        image,
        imageAlt: str(r.imageAlt) || undefined,
        imageSide: side,
        credit: str(r.credit) || undefined,
      };
    }
    default:
      return null;
  }
}

export function toSlides(raw: unknown): Slide[] {
  return arr(raw).map(toSlide).filter((s): s is Slide => !!s);
}

export function toCase(raw: unknown): ClinicalCase | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const options = arr<Record<string, unknown>>(r.options).map((o) => ({ label: str(o.label), correct: !!o.correct, rationale: str(o.rationale) })).filter((o) => o.label);
  if (!str(r.vignette) || options.length < 2) return null;
  return {
    title: str(r.title), vignette: str(r.vignette), question: str(r.question), teaching: str(r.teaching),
    reward: Number(r.reward) || 40,
    data: arr<Record<string, unknown>>(r.data).map((d) => ({ label: str(d.label), value: str(d.value) })).filter((d) => d.label),
    options,
  };
}

type LessonLike = { position: number; slides?: unknown; monograph?: string | null; clinical_case?: unknown; quick_ref?: string | null };

/**
 * Built-in curated decks (Peptídeos) win for the freemium flagship.
 * Other courses: database content wins; files are the fallback.
 */
export function resolveRich(lesson: LessonLike, courseSlug: string): RichLesson | null {
  const curated = getRichLesson(courseSlug, lesson.position);
  if (curated && curated.slides.length >= 5) return curated;

  const slides = toSlides(lesson.slides);
  const c = toCase(lesson.clinical_case);
  const mono = lesson.monograph?.trim() ?? "";
  const qr = lesson.quick_ref?.trim() ?? "";
  if (slides.length || c || mono || qr) {
    return {
      slides,
      monograph: mono,
      quickRef: qr,
      clinicalCase: c ?? { title: "", vignette: "", data: [], question: "", options: [], teaching: "", reward: 0 },
    };
  }
  return curated;
}
