/** Freemium Doutiva: trilha de peptídeos liberada; demais cursos exigem Protocolos. */

export const FREE_COURSE_SLUGS = ["peptideos-medicina-de-precisao"] as const;

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
