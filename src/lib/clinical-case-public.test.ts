import { describe, expect, it } from "vitest";
import {
  gradeClinicalCase,
  redactClinicalCaseJson,
  toPublicClinicalCase,
} from "./clinical-case-public";
import type { ClinicalCase } from "@/content/lesson-types";

const sample: ClinicalCase = {
  title: "Caso",
  vignette: "Paciente 54a",
  data: [{ label: "IMC", value: "31" }],
  question: "Conduta?",
  options: [
    { label: "A", correct: false, rationale: "Não" },
    { label: "B", correct: true, rationale: "Sim" },
  ],
  teaching: "Ensino",
  reward: 40,
};

describe("toPublicClinicalCase", () => {
  it("strips answer keys before the client", () => {
    const pub = toPublicClinicalCase(sample);
    expect(pub.options).toEqual([{ label: "A" }, { label: "B" }]);
    expect(pub).not.toHaveProperty("teaching");
    expect(JSON.stringify(pub)).not.toMatch(/correct|rationale|Ensino/);
  });
});

describe("gradeClinicalCase", () => {
  it("grades on the server against the private case", () => {
    expect(gradeClinicalCase(sample, 1).correct).toBe(true);
    expect(gradeClinicalCase(sample, 0).correct).toBe(false);
    expect(gradeClinicalCase(sample, 1).teaching).toBe("Ensino");
  });

  it("rejects invalid option indexes", () => {
    expect(() => gradeClinicalCase(sample, 9)).toThrow(/inválida/i);
  });
});

describe("redactClinicalCaseJson", () => {
  it("redacts jsonb-shaped lesson payloads", () => {
    const redacted = redactClinicalCaseJson({
      title: "T",
      vignette: "V",
      question: "Q",
      teaching: "SECRET",
      options: [
        { label: "A", correct: true, rationale: "x" },
        { label: "B", correct: false, rationale: "y" },
      ],
      data: [{ label: "Peso", value: "80" }],
    });
    expect(redacted?.options).toEqual([{ label: "A" }, { label: "B" }]);
    expect(JSON.stringify(redacted)).not.toMatch(/SECRET|correct|rationale/);
  });
});
