import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("events")
      .select("id, slug, title, subtitle, description, kind, location, starts_at, ends_at, capacity, price_cents, featured")
      .eq("published", true)
      .order("starts_at", { ascending: true });
    if (error) throw error;
    const { data: regs } = await supabase
      .from("event_registrations").select("event_id").eq("user_id", userId);
    const set = new Set((regs ?? []).map((r) => r.event_id));
    return (data ?? []).map((e) => ({ ...e, registered: set.has(e.id) }));
  });

export const toggleEventRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { eventId: string }) => z.object({ eventId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("event_registrations").select("id")
      .eq("event_id", data.eventId).eq("user_id", userId).maybeSingle();
    if (existing) {
      await supabase.from("event_registrations").delete().eq("id", existing.id);
      return { registered: false };
    }
    const { error } = await supabase.from("event_registrations")
      .insert({ event_id: data.eventId, user_id: userId });
    if (error) throw error;
    return { registered: true };
  });