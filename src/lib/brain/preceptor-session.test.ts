import { describe, expect, it } from "vitest";
import { caseIndexForDate } from "@/lib/daily-case";

describe("personal case rotation stability", () => {
  it("keeps calendar index in range", () => {
    expect(caseIndexForDate(new Date("2026-11-07T15:00:00Z"), 10)).toBeGreaterThanOrEqual(0);
    expect(caseIndexForDate(new Date("2026-11-07T15:00:00Z"), 10)).toBeLessThan(10);
  });
});
