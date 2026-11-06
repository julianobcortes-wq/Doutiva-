import { describe, it, expect } from "vitest";
import { nextReview, addDays } from "./review";

const fresh = { ease: 2.5, interval_days: 0, reps: 0, lapses: 0 };

describe("revisão espaçada", () => {
  it("primeiro acerto volta em 1 dia, segundo em 3", () => {
    const a = nextReview(fresh, true);
    expect(a.interval_days).toBe(1);
    expect(nextReview(a, true).interval_days).toBe(3);
  });
  it("erro traz a questão de volta amanhã e zera a sequência", () => {
    const r = nextReview({ ease: 2.5, interval_days: 10, reps: 4, lapses: 0 }, false);
    expect(r).toMatchObject({ interval_days: 1, reps: 0, lapses: 1 });
  });
  it("soma dias na data", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
  });
});
