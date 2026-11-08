import { describe, it, expect } from "vitest";
import { checkCitations, gateCorpusCitations, scoreCitationFidelity } from "./citations";

describe("conferência de referências", () => {
  it("aponta citação para referência que não existe", () => {
    expect(checkCitations("Reduz HbA1c [1] e peso [S4].", 2).broken).toEqual([4]);
  });
  it("aponta referência nunca citada", () => {
    expect(checkCitations("Ver [1, 3].", 3).uncited).toEqual([2]);
  });
  it("tudo certo quando cada citação existe", () => {
    expect(checkCitations("A [1] B [2]", 2)).toEqual({ cited: 2, broken: [], uncited: [] });
  });
});

describe("gateCorpusCitations", () => {
  it("remove [S#] inventados e mantém os válidos", () => {
    const out = gateCorpusCitations("Semaglutida reduz eventos [S1] e também [S9].", 2);
    expect(out.stripped).toBe(true);
    expect(out.broken).toEqual([9]);
    expect(out.text).toContain("[S1]");
    expect(out.text).not.toContain("[S9]");
    expect(out.text).toMatch(/Aviso de evidência/i);
  });

  it("não altera texto quando o corpus cobre as citações", () => {
    const src = "Evidência A em [S1] e [S2].";
    const out = gateCorpusCitations(src, 2);
    expect(out.stripped).toBe(false);
    expect(out.text).toBe(src);
  });

  it("remove todas as marcações quando não há corpus", () => {
    const out = gateCorpusCitations("Segundo [S1] e [2], a conduta muda.", 0);
    expect(out.stripped).toBe(true);
    expect(out.text).not.toMatch(/\[S?\d/);
    expect(out.text).toMatch(/não estava ancorada|não cobria|removidas/i);
  });
});

describe("scoreCitationFidelity", () => {
  it("marca citação fraca quando o trecho não cobre a frase", () => {
    const out = scoreCitationFidelity("A semaglutida reduz MACE em 20% [S1].", [
      { excerpt: "Estudo sobre peixes amazônicos e dieta." },
    ]);
    expect(out.checked).toBe(1);
    expect(out.weak).toBe(1);
  });

  it("aceita sobreposição lexical razoável", () => {
    const out = scoreCitationFidelity("Semaglutida reduz eventos cardiovasculares MACE [S1].", [
      { excerpt: "Semaglutida reduziu eventos cardiovasculares MACE no SELECT." },
    ]);
    expect(out.checked).toBe(1);
    expect(out.weak).toBe(0);
  });
});
