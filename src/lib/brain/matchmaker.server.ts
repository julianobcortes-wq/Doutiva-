/**
 * Matchmaker — indica mentor parceiro a partir do mapa (quando há base).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getMastery } from "@/lib/brain/brain.server";

export type MentorMatch = {
  mentorId: string;
  slug: string;
  name: string;
  specialty: string | null;
  score: number;
  reason: string;
  offeringId?: string;
  offeringTitle?: string;
  priceCents?: number;
};

export async function matchMentor(
  supabase: SupabaseClient<any>,
  userId: string,
  limit = 3,
): Promise<MentorMatch[]> {
  const map = await getMastery(supabase, userId).catch(() => null);
  const reds = (map?.mastery ?? [])
    .filter((m) => m.attempts > 0 && m.band !== "green")
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  const { data: mentors } = await supabase
    .from("mentors")
    .select("id, slug, name, specialty, bio, featured, published, rating")
    .eq("published", true)
    .order("featured", { ascending: false })
    .limit(40);

  if (!mentors?.length) return [];

  const { data: offerings } = await supabase
    .from("mentor_offerings")
    .select("id, mentor_id, title, price_cents, kind, active")
    .eq("active", true);

  const byMentor = new Map<string, { id: string; title: string; price_cents: number; kind: string }[]>();
  for (const o of offerings ?? []) {
    const list = byMentor.get(o.mentor_id) ?? [];
    list.push(o);
    byMentor.set(o.mentor_id, list);
  }

  const scored: MentorMatch[] = mentors.map((m: any) => {
    let score = Number(m.rating ?? 0) * 5 + (m.featured ? 10 : 0);
    const reasons: string[] = [];
    const spec = String(m.specialty ?? m.bio ?? "").toLowerCase();
    for (const r of reds) {
      const needle = (r.topic?.specialty || r.topic?.slug || "").toLowerCase();
      if (needle && spec.includes(needle.slice(0, 6))) {
        score += 20;
        reasons.push(`Alinha a lacuna: ${r.topic?.title ?? needle}`);
      }
    }
    const offs = byMentor.get(m.id) ?? [];
    if (offs.length) {
      score += 8;
      reasons.push(`${offs.length} oferta(s) ativa(s)`);
    }
    const top = offs[0];
    return {
      mentorId: m.id as string,
      slug: m.slug as string,
      name: m.name as string,
      specialty: (m.specialty as string) ?? null,
      score,
      reason: reasons[0] ?? "Parceiro Doutiva",
      offeringId: top?.id,
      offeringTitle: top?.title,
      priceCents: top?.price_cents,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
