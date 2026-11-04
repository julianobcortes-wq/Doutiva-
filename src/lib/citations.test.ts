import { describe, it, expect } from "vitest";
import { checkCitations } from "./citations";

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
