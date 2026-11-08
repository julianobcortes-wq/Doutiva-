import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listTools = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tools")
      .select("id, slug, name, tagline, description, category, logo_url, url, discount_label, featured")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });