import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listMentors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mentors")
      .select(
        "id, slug, name, title, specialty, location, bio, avatar_url, hourly_rate_cents, rating, sessions_count, featured",
      )
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("rating", { ascending: false });
    if (error) {
      console.error("listMentors", error);
      return [];
    }
    return data ?? [];
  });

export const getMentorBySlug = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: mentor, error } = await context.supabase
      .from("mentors")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) {
      console.error("getMentorBySlug", error);
      return null;
    }
    return mentor;
  });

export const requestMentorSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { mentorId: string; topic: string; preferredAt?: string }) =>
    z
      .object({
        mentorId: z.string().uuid(),
        topic: z.string().min(3).max(500),
        preferredAt: z.string().optional(),
      })
      .parse(d),
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
      .select(
        "id, topic, status, preferred_at, scheduled_at, mentor_notes, created_at, mentor_id, user_id, mentors(name, slug, owner_user_id)",
      )
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) throw error;
    return (data ?? []).map((s: any) => ({
      id: s.id as string,
      topic: s.topic as string,
      status: s.status as string,
      preferred_at: (s.preferred_at ?? null) as string | null,
      scheduled_at: (s.scheduled_at ?? null) as string | null,
      mentor_notes: (s.mentor_notes ?? null) as string | null,
      created_at: s.created_at as string,
      mentor_id: s.mentor_id as string,
      user_id: s.user_id as string,
      mentor_name: (s.mentors?.name ?? "Mentor") as string,
      mentor_slug: (s.mentors?.slug ?? "") as string,
      mine_as_mentor: s.mentors?.owner_user_id === context.userId,
      mine_as_student: s.user_id === context.userId,
    }));
  });

export const respondMentorSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id: string;
      status: "accepted" | "declined" | "completed";
      scheduledAt?: string;
      notes?: string;
    }) =>
      z
        .object({
          id: z.string().uuid(),
          status: z.enum(["accepted", "declined", "completed"]),
          scheduledAt: z.string().datetime().optional(),
          notes: z.string().max(2000).optional(),
        })
        .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("mentor_sessions")
      .select("id, mentors(owner_user_id)")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) throw new Error("Solicitação não encontrada.");
    const owner = (row as any).mentors?.owner_user_id as string | null;
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (owner !== context.userId && !admin)
      throw new Error("Sem permissão para responder esta mentoria.");
    const { error: uerr } = await context.supabase
      .from("mentor_sessions")
      .update({
        status: data.status,
        scheduled_at: data.scheduledAt ?? null,
        mentor_notes: data.notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (uerr) throw uerr;
    return { ok: true };
  });
