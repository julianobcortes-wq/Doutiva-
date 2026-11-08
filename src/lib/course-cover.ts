/** Resolve a course cover to a renderable image URL, or null for abstract fallback. */
export function courseCoverSrc(
  coverUrl?: string | null,
  slug?: string | null,
): string | null {
  const raw = (coverUrl || "").trim();
  if (raw.startsWith("/") || raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  if (slug) return `/covers/${slug}.jpg`;
  return null;
}
