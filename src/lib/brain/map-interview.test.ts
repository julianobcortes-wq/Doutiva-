import { describe, expect, it } from "vitest";
import {
  MAP_INTERVIEW_QUESTIONS,
  mapInterviewSentence,
  mapProgressLabel,
  mapProgressPct,
} from "@/lib/brain/map-interview";

describe("map interview framing", () => {
  it("states a fixed question count", () => {
    expect(mapInterviewSentence()).toContain(`${MAP_INTERVIEW_QUESTIONS} perguntas`);
  });

  it("labels current question like NPS progress", () => {
    expect(mapProgressLabel(0)).toBe(`Pergunta 1 de ${MAP_INTERVIEW_QUESTIONS}`);
    expect(mapProgressLabel(3)).toBe(`Pergunta 4 de ${MAP_INTERVIEW_QUESTIONS}`);
    expect(mapProgressLabel(8)).toBe(`Pergunta 8 de ${MAP_INTERVIEW_QUESTIONS}`);
  });

  it("computes percent complete", () => {
    expect(mapProgressPct(0)).toBe(0);
    expect(mapProgressPct(4)).toBe(50);
    expect(mapProgressPct(8)).toBe(100);
  });
});
