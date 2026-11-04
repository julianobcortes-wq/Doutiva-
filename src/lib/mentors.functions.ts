import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listMentors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mentors")
      .select("id, slug, name, title, specialty, location, bio, avatar_url, hourly_rate_cents, rating, sessions_count, featured")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("rating", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getMentorBySlug = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: mentor, error } = await context.supabase
      .from("mentors").select("*").eq("slug", data.slug).eq("published", true).maybeSingle();
    if (error) throw error;
    return mentor;
  });

export const requestMentorSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { mentorId: string; topic: string; preferredAt?: string }) =>
    z.object({
      mentorId: z.string().uuid(),
      topic: z.string().min(3).max(500),
      preferredAt: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("mentor_sessions").insert({
      mentor_id: data.mentorId,
      user_id: context.userId,
      topic: data.topic,
      preferred_at: data.preferredAt ?? null,
    });
    if (error) throw error;
    return { ok: true };
  });

export const listMentorSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mentor_sessions")
      .select("id, topic, status, preferred_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return data ?? [];
  });