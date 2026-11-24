import { describe, expect, it } from "vitest";

// Light unit coverage for specialty → course preference order used by Minha Trilha.
import { accessForCourse } from "@/lib/freemium";

describe("trail freemium access for seeded catalog", () => {
  it("opens freemium clinical tracks without subscription", () => {
    expect(accessForCourse("tirzepatida-incretinas-consultorio", null)).toBe("full");
    expect(accessForCourse("peptideos-medicina-de-precisao", null)).toBe("full");
    expect(accessForCourse("etica-publicidade-prontuario", null)).toBe("full");
    expect(accessForCourse("dexa-composicao-operacional", null)).toBe("full");
  });
});
