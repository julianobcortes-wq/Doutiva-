import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listSpaces = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("community_spaces")
      .select("id, slug, name, specialty, description, members_count, featured")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("members_count", { ascending: false });
    if (error) {
      console.error("listSpaces", error);
      return [];
    }
    return data ?? [];
  });

export const getSpaceBySlug = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: space, error } = await supabase
      .from("community_spaces").select("*").eq("slug", data.slug).maybeSingle();
    if (error) {
      console.error("getSpaceBySlug", error);
      return null;
    }
    if (!space) return null;
    const { data: posts } = await supabase
      .from("community_posts")
      .select("id, title, body, created_at, user_id")
      .eq("space_id", space.id)
      .order("created_at", { ascending: false })
      .limit(50);
    const userIds = Array.from(new Set((posts ?? []).map((p) => p.user_id)));
    let authors: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles").select("id, display_name, avatar_url").in("id", userIds);
      authors = Object.fromEntries((profs ?? []).map((p) => [p.id, { display_name: p.display_name, avatar_url: p.avatar_url }]));
    }
    return {
      ...space,
      posts: (posts ?? []).map((p) => ({ ...p, author: authors[p.user_id] ?? null })),
    };
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { spaceId: string; title: string; body: string }) =>
    z.object({
      spaceId: z.string().uuid(),
      title: z.string().min(3).max(160),
      body: z.string().min(3).max(4000),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("community_posts").insert({
      space_id: data.spaceId,
      user_id: context.userId,
      title: data.title,
      body: data.body,
    });
    if (error) throw error;
    return { ok: true };
  });