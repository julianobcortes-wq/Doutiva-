/** Freemium Doutiva: peptídeos + Negócios liberados (entrada EAD); clínica avançada exige Protocolos. */

export const FREE_COURSE_SLUGS = [
  "peptideos-medicina-de-precisao",
  "manipulados-injetaveis-criterio",
  "hormonios-implantes-criterio",
  "soroterapia-injetaveis-estereis",
  "obesidade-precisao-consultorio",
  "tirzepatida-incretinas-consultorio",
  "precificacao-margem-consultorio",
  "funil-clinico-agenda",
  "gestao-clinica-uma-pagina",
  "posicionamento-autoridade-digital",
  "escala-equipe-mentoria-produtos",
] as const;

export type AccessLevel = "full" | "locked";

export function isFreeCourseSlug(slug: string): boolean {
  return (FREE_COURSE_SLUGS as readonly string[]).includes(slug);
}

export function subscriptionIsActive(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

export function accessForCourse(
  slug: string,
  subStatus: string | null | undefined,
): AccessLevel {
  if (isFreeCourseSlug(slug)) return "full";
  if (subscriptionIsActive(subStatus)) return "full";
  return "locked";
}
