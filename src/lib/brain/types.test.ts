import { describe, expect, it } from "vitest";
import { bandFromScore, confidenceToNumber } from "@/lib/brain/types";

describe("brain mastery bands", () => {
  it("marks green only with score and confidence", () => {
    expect(bandFromScore(80, 0.7)).toBe("green");
    expect(bandFromScore(80, 0.4)).toBe("yellow");
  });

  it("marks yellow and red thresholds", () => {
    expect(bandFromScore(50, 0.5)).toBe("yellow");
    expect(bandFromScore(40, 0.9)).toBe("red");
  });

  it("maps confidence labels", () => {
    expect(confidenceToNumber("sei")).toBe(0.9);
    expect(confidenceToNumber("acho")).toBe(0.55);
    expect(confidenceToNumber("nao_sei")).toBe(0.2);
  });
});
