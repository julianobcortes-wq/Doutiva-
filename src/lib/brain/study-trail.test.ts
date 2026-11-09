import { describe, expect, it } from "vitest";
import type { MasteryRow } from "@/lib/brain/types";

/**
 * Lightweight unit coverage for trail reason/band labeling.
 * Full buildStudyTrail needs Supabase — covered at integration level.
 */
function bandLabel(band: "green" | "yellow" | "red" | "untouched"): string {
  if (band === "red") return "Lacuna";
  if (band === "yellow") return "Parcial";
  if (band === "green") return "Reforço";
  return "Ainda não calibrado";
}

function reasonFor(row: Pick<MasteryRow, "attempts" | "band"> & { topic?: { title?: string } }) {
  const untouched = row.attempts === 0;
  const band = untouched ? "untouched" : row.band;
  const topic = row.topic?.title ?? "tema do mapa";
  return `${bandLabel(band)} · ${topic}`;
}

describe("study trail reasons", () => {
  it("marks untouched topics as não calibrado", () => {
    expect(
      reasonFor({ attempts: 0, band: "red", topic: { title: "Incretinas" } }),
    ).toBe("Ainda não calibrado · Incretinas");
  });

  it("labels red gaps as Lacuna", () => {
    expect(
      reasonFor({ attempts: 2, band: "red", topic: { title: "Eixo GH" } }),
    ).toBe("Lacuna · Eixo GH");
  });
});
