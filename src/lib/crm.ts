/** Brazilian CRM helpers — format + soft validation (no CFM API dependency). */

const UF = new Set(
  "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" "),
);

export function normalizeCrm(crm: string) {
  return crm.replace(/\D/g, "");
}

export function isValidCrmUf(uf: string) {
  return UF.has(uf.toUpperCase());
}

/**
 * Format check used at registration. Official CFM lookup remains editorial/admin.
 * Rules: 4–8 digits, UF válida, rejeita sequências triviais (0000, 1111111…).
 */
export function validateCrm(crm: string, uf: string): { ok: boolean; error?: string; digits?: string } {
  if (!isValidCrmUf(uf)) return { ok: false, error: "UF do CRM inválida." };
  const digits = normalizeCrm(crm);
  if (!/^\d{4,8}$/.test(digits)) return { ok: false, error: "CRM deve ter entre 4 e 8 dígitos." };
  if (/^(\d)\1+$/.test(digits)) return { ok: false, error: "CRM inválido (sequência repetida)." };
  if (digits === "123456" || digits === "1234567" || digits === "12345678") {
    return { ok: false, error: "CRM inválido." };
  }
  return { ok: true, digits };
}

export function formatCrmLabel(crm: string, uf: string) {
  const v = validateCrm(crm, uf);
  if (!v.ok || !v.digits) return `${crm}/${uf}`;
  return `CRM-${uf.toUpperCase()} ${v.digits}`;
}
