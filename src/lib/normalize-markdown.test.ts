import { describe, expect, it } from "vitest";
import { normalizeMarkdown } from "./normalize-markdown";

describe("normalizeMarkdown", () => {
  it("splits jammed heading after prose", () => {
    const out = normalizeMarkdown("checklist para o médico --- ### 1. Contexto Clínico");
    expect(out).toContain("---\n\n");
    expect(out).toContain("\n\n### 1. Contexto");
  });

  it("keeps already valid markdown", () => {
    const src = "# Título\n\n## Seção\n\nParágrafo.\n";
    expect(normalizeMarkdown(src)).toContain("# Título");
    expect(normalizeMarkdown(src).split("\n").length).toBeGreaterThan(3);
  });
});
