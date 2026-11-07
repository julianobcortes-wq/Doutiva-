import { describe, expect, it } from "vitest";
import { caseIndexForDate, saoPauloDayKey, toPublicDailyCase, FALLBACK_CASES } from "./daily-case";

describe("saoPauloDayKey", () => {
  it("formats a stable civil day in America/Sao_Paulo", () => {
    // 2026-11-04 02:00 UTC = 2026-11-03 23:00 in São Paulo
    const lateUtc = new Date("2026-11-04T02:00:00.000Z");
    expect(saoPauloDayKey(lateUtc)).toBe("2026-11-03");
    // 2026-11-04 03:30 UTC = 2026-11-04 00:30 in São Paulo
    const earlySp = new Date("2026-11-04T03:30:00.000Z");
    expect(saoPauloDayKey(earlySp)).toBe("2026-11-04");
  });
});

describe("caseIndexForDate", () => {
  it("is stable for the same SP civil day", () => {
    const a = caseIndexForDate(new Date("2026-11-04T12:00:00.000Z"), 9);
    const b = caseIndexForDate(new Date("2026-11-04T23:00:00.000Z"), 9);
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(9);
  });
});

describe("toPublicDailyCase", () => {
  it("never leaks answer keys from fallback peptide cases", () => {
    const pub = toPublicDailyCase(FALLBACK_CASES[0]);
    expect(JSON.stringify(pub)).not.toMatch(/"correct"|rationale|teaching/i);
  });
});
