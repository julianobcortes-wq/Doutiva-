import { describe, expect, it } from "vitest";
import { formatCrmLabel, validateCrm } from "./crm";

describe("validateCrm", () => {
  it("aceita CRM comum", () => {
    expect(validateCrm("528471", "SP")).toEqual({ ok: true, digits: "528471" });
  });
  it("rejeita UF inválida", () => {
    expect(validateCrm("528471", "XX").ok).toBe(false);
  });
  it("rejeita sequência trivial", () => {
    expect(validateCrm("000000", "RJ").ok).toBe(false);
  });
  it("rejeita sequência crescente óbvia", () => {
    expect(validateCrm("123456", "SP").ok).toBe(false);
  });
  it("formata rótulo", () => {
    expect(formatCrmLabel("528471", "sp")).toBe("CRM-SP 528471");
  });
});

