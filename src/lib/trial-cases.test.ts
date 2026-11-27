import { describe, expect, it } from "vitest";
import { FALLBACK_CASES } from "@/lib/daily-case";
import {
  createTrialRateLimiter,
  gradeActiveTrialCase,
  resolveTrialTheme,
  selectTrialCases,
  toPublicTrialCase,
  validateTrialGradeInput,
  type TrialCaseRecord,
} from "@/lib/trial-cases";

function fallbackPool(): TrialCaseRecord[] {
  return FALLBACK_CASES.map((item) => ({
    ...item,
    ...resolveTrialTheme(item),
  }));
}

describe("trial-cases selection and redaction", () => {
  it("selects 3 distinct general-clinical themes when TRIAL_CASE_KEYS is empty", () => {
    const selected = selectTrialCases(fallbackPool(), [], 3);
    expect(selected).toHaveLength(3);
    const themes = new Set(selected.map((c) => c.themeKey));
    expect(themes.size).toBe(3);
    // General clinical themes (priority 1) are prioritized over narrower themes
    expect(selected.every((c) => c.themePriority === 1)).toBe(true);
  });

  it("respects explicit TRIAL_CASE_KEYS order when configured", () => {
    const selected = selectTrialCases(fallbackPool(), ["static-9", "static-4", "static-2"], 3);
    expect(selected.map((c) => c.key)).toEqual(["static-9", "static-4", "static-2"]);
  });

  it("never leaks answer keys, rationales, or teaching in public trial payloads", () => {
    const selected = selectTrialCases(fallbackPool(), [], 3);
    const pub = selected.map(toPublicTrialCase);
    const serialized = JSON.stringify(pub);
    expect(serialized).not.toMatch(/"correct"|correctOption|rationale|teaching/i);
    for (const item of pub) {
      expect(item.key).toBeTruthy();
      expect(item.theme).toBeTruthy();
      expect(item.caseData.vignette).toBeTruthy();
      expect(item.caseData.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("trial-cases validation and grading", () => {
  it("grades active trial cases accurately and returns explanation", () => {
    const active = selectTrialCases(fallbackPool(), [], 3);
    const first = active[0];
    const correctIdx = first.c.options.findIndex((o) => o.correct);
    const wrongIdx = first.c.options.findIndex((o) => !o.correct);

    const rightRes = gradeActiveTrialCase(active, { caseKey: first.key, option: correctIdx });
    expect(rightRes.correct).toBe(true);
    expect(rightRes.correctOption).toBe(correctIdx);
    expect(rightRes.explanation.length).toBeGreaterThan(10);

    const wrongRes = gradeActiveTrialCase(active, { caseKey: first.key, option: wrongIdx });
    expect(wrongRes.correct).toBe(false);
    expect(wrongRes.correctOption).toBe(correctIdx);
    expect(wrongRes.explanation.length).toBeGreaterThan(10);
  });

  it("rejects any caseKey outside the 3 active trial cases", () => {
    const active = selectTrialCases(fallbackPool(), [], 3);
    const activeKeys = new Set(active.map((c) => c.key));
    const nonTrial = FALLBACK_CASES.find((c) => !activeKeys.has(c.key));
    expect(nonTrial).toBeDefined();

    expect(() =>
      gradeActiveTrialCase(active, { caseKey: nonTrial!.key, option: 0 }),
    ).toThrow(/amostra/i);

    expect(() =>
      gradeActiveTrialCase(active, { caseKey: "random-lesson-uuid", option: 0 }),
    ).toThrow(/amostra/i);
  });

  it("validates option bounds and caseKey length", () => {
    expect(() => validateTrialGradeInput({ caseKey: "", option: 0 })).toThrow();
    expect(() => validateTrialGradeInput({ caseKey: "a".repeat(101), option: 0 })).toThrow();
    expect(() => validateTrialGradeInput({ caseKey: "static-1", option: -1 })).toThrow();
    expect(() => validateTrialGradeInput({ caseKey: "static-1", option: 1.5 })).toThrow();
  });
});

describe("trial rate limiter", () => {
  it("allows up to 30 gradings per IP in 10 minutes and blocks the 31st", () => {
    const limiter = createTrialRateLimiter(30, 10 * 60 * 1000);
    const t0 = 1_700_000_000_000;
    for (let i = 0; i < 30; i++) {
      expect(limiter.consume("203.0.113.10", t0 + i * 100)).toBe(true);
    }
    expect(limiter.consume("203.0.113.10", t0 + 3_500)).toBe(false);
    // Different IP is unaffected
    expect(limiter.consume("203.0.113.11", t0 + 3_500)).toBe(true);
    // Window expires after 10 minutes
    expect(limiter.consume("203.0.113.10", t0 + 10 * 60 * 1000 + 1)).toBe(true);
  });
});
