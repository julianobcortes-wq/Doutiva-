import {
  gradeClinicalCase,
  toPublicClinicalCase,
  type PublicClinicalCase,
} from "@/lib/clinical-case-public";
import type { DailyCase } from "@/lib/daily-case";

export const TRIAL_CASE_COUNT = 3;
export const TRIAL_CACHE_TTL_MS = 10 * 60 * 1000;
export const TRIAL_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const TRIAL_RATE_LIMIT_MAX = 30;
const MAX_TRACKED_IPS = 10_000;

export type TrialCaseRecord = DailyCase & {
  theme: string;
  themeKey: string;
  themePriority: number;
  topicIds: string[];
};

export type TrialCasePublic = {
  key: string;
  caseData: PublicClinicalCase;
  lessonTitle: string;
  theme: string;
  topicIds: string[];
};

export type TrialGradeResult = {
  correct: boolean;
  correctOption: number;
  explanation: string;
};

export type TopicMeta = {
  id: string;
  title: string;
  specialty?: string | null;
};

type ThemeRule = {
  key: string;
  label: string;
  priority: number;
  pattern: RegExp;
};

/**
 * General clinical theme inference used when a lesson has no explicit clinical_topics link.
 * Labels deliberately avoid substance/drug names.
 */
const THEME_RULES: readonly ThemeRule[] = [
  {
    key: "regulacao-seguranca",
    label: "Regulação e segurança clínica",
    priority: 1,
    pattern: /regula|anvisa|cfm|wada|off-label|irregular|ética|frasco|liofilizad|procedência/i,
  },
  {
    key: "risco-cardiovascular",
    label: "Risco cardiovascular",
    priority: 1,
    pattern: /infarto|iam|cardio|coronari|stent|mace|ateroscler|hipertens|prevenção secundária/i,
  },
  {
    key: "composicao-corporal",
    label: "Composição corporal e envelhecimento",
    priority: 1,
    pattern: /sarcopen|massa magra|osteopen|dexa|preensão|força muscular/i,
  },
  {
    key: "metabolismo-renal",
    label: "Metabolismo e função renal",
    priority: 1,
    pattern: /\bdrc\b|renal|tfge|nefro|albumin|gliclaz|insulina/i,
  },
  {
    key: "manejo-efeitos",
    label: "Manejo de efeitos e titulação",
    priority: 2,
    pattern: /náusea|titula|escalon|efeito adverso|gastro|tolerab/i,
  },
  {
    key: "medicina-esportiva",
    label: "Medicina esportiva e evidência",
    priority: 2,
    pattern: /tendin|reparo|lesão|maraton|atleta|antidop|esport/i,
  },
  {
    key: "eixo-hormonal",
    label: "Endocrinologia e eixo hormonal",
    priority: 2,
    pattern: /igf-1|eixo|secretagog|hormon|\bgh\b/i,
  },
  {
    key: "decisao-terapeutica",
    label: "Decisão terapêutica em consultório",
    priority: 2,
    pattern: /respondedor|platô|\bsop\b|ajuste|protocolo|manutenção/i,
  },
];

function slugifyTheme(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Resolve a clean clinical theme label and deduplication key for a lesson case. */
export function resolveTrialTheme(
  item: DailyCase,
  linkedTopics: readonly TopicMeta[] = [],
): { theme: string; themeKey: string; themePriority: number; topicIds: string[] } {
  if (linkedTopics.length > 0) {
    const primary = linkedTopics[0];
    const label = primary.title.trim();
    const spec = primary.specialty?.trim();
    if (label) {
      return {
        theme: label,
        themeKey: slugifyTheme(spec || label) || primary.id,
        themePriority: 1,
        topicIds: linkedTopics.map((t) => t.id),
      };
    }
  }

  const haystack = `${item.lessonTitle} ${item.c.title} ${item.c.vignette} ${item.courseTitle}`;
  for (const rule of THEME_RULES) {
    if (rule.pattern.test(haystack)) {
      return {
        theme: rule.label,
        themeKey: rule.key,
        themePriority: rule.priority,
        topicIds: [],
      };
    }
  }

  const fallbackLabel = item.lessonTitle?.trim() || item.courseTitle?.trim() || "Raciocínio clínico";
  return {
    theme: fallbackLabel,
    themeKey: slugifyTheme(fallbackLabel) || item.key,
    themePriority: 3,
    topicIds: [],
  };
}

/**
 * Select 3 trial cases:
 * - If `fixedKeys` is non-empty, picks matching cases in that order first.
 * - Otherwise (or to complete up to 3), picks cases from distinct themes,
 *   preferring general clinical themes (lower `themePriority`) first.
 */
export function selectTrialCases(
  pool: readonly TrialCaseRecord[],
  fixedKeys: readonly string[],
  count = TRIAL_CASE_COUNT,
): TrialCaseRecord[] {
  const validPool = pool.filter(
    (item) =>
      Boolean(item.c?.vignette) &&
      Array.isArray(item.c?.options) &&
      item.c.options.length >= 2 &&
      item.c.options.some((o) => o.correct),
  );

  const selected: TrialCaseRecord[] = [];
  const usedKeys = new Set<string>();
  const usedThemes = new Set<string>();

  for (const rawKey of fixedKeys) {
    if (selected.length >= count) break;
    const key = rawKey.trim();
    if (!key || usedKeys.has(key)) continue;
    const found = validPool.find((item) => item.key === key);
    if (!found) continue;
    selected.push(found);
    usedKeys.add(found.key);
    usedThemes.add(found.themeKey);
  }

  if (selected.length >= count) return selected;

  // Prefer lower themePriority (general clinical themes), preserving original order on ties.
  const ordered = validPool
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => a.item.themePriority - b.item.themePriority || a.idx - b.idx)
    .map((entry) => entry.item);

  // First pass: distinct themes only.
  for (const item of ordered) {
    if (selected.length >= count) break;
    if (usedKeys.has(item.key) || usedThemes.has(item.themeKey)) continue;
    selected.push(item);
    usedKeys.add(item.key);
    usedThemes.add(item.themeKey);
  }

  // Second pass: if fewer than `count` distinct themes exist, fill remaining slots.
  for (const item of ordered) {
    if (selected.length >= count) break;
    if (usedKeys.has(item.key)) continue;
    selected.push(item);
    usedKeys.add(item.key);
  }

  return selected;
}

/** Redact a TrialCaseRecord so answer keys, rationales, and teaching never leave the server. */
export function toPublicTrialCase(item: TrialCaseRecord): TrialCasePublic {
  return {
    key: item.key,
    caseData: toPublicClinicalCase(item.c),
    lessonTitle: item.lessonTitle,
    theme: item.theme,
    topicIds: item.topicIds,
  };
}

/** Validate gradeTrialCase payload (mirrors answerDailyCase bounds). */
export function validateTrialGradeInput(input: { caseKey: string; option: number }): {
  caseKey: string;
  option: number;
} {
  if (
    typeof input?.caseKey !== "string" ||
    input.caseKey.trim().length === 0 ||
    input.caseKey.length > 100 ||
    !Number.isInteger(input?.option) ||
    input.option < 0
  ) {
    throw new Error("Resposta inválida");
  }
  return {
    caseKey: input.caseKey.trim(),
    option: input.option,
  };
}

/** Grade a trial answer strictly against the active trial case allowlist. */
export function gradeActiveTrialCase(
  activeCases: readonly TrialCaseRecord[],
  input: { caseKey: string; option: number },
): TrialGradeResult {
  const { caseKey, option } = validateTrialGradeInput(input);
  const match = activeCases.find((item) => item.key === caseKey);
  if (!match) {
    throw new Error("Caso não disponível nesta amostra.");
  }
  const grade = gradeClinicalCase(match.c, option);
  const correctOption = grade.options.findIndex((o) => o.correct);
  const correctRationale = correctOption >= 0 ? grade.options[correctOption]?.rationale?.trim() : "";
  const explanation = correctRationale || grade.teaching?.trim() || "";

  return {
    correct: grade.correct,
    correctOption,
    explanation,
  };
}

/** Simple in-memory IP rate limiter (30 gradings / 10 min per IP). */
export function createTrialRateLimiter(
  maxRequests = TRIAL_RATE_LIMIT_MAX,
  windowMs = TRIAL_RATE_LIMIT_WINDOW_MS,
) {
  const hits = new Map<string, number[]>();

  return {
    consume(ip: string, now = Date.now()): boolean {
      const key = (ip || "unknown").slice(0, 120);
      const recent = (hits.get(key) ?? []).filter((ts) => now - ts < windowMs);
      if (recent.length >= maxRequests) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      if (!hits.has(key) && hits.size >= MAX_TRACKED_IPS) {
        const oldest = hits.keys().next().value;
        if (oldest !== undefined) hits.delete(oldest);
      }
      hits.set(key, recent);
      return true;
    },
    reset() {
      hits.clear();
    },
  };
}
