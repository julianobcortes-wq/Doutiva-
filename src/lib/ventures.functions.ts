import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listVentures = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("ventures")
      .select("id, slug, name, tagline, description, sector, stage, kind, raise_target_cents, status, featured")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    const { data: interests } = await supabase
      .from("venture_interests").select("venture_id").eq("user_id", userId);
    const set = new Set((interests ?? []).map((i) => i.venture_id));
    return (data ?? []).map((v) => ({ ...v, interested: set.has(v.id) }));
  });

export const expressInterest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ventureId: string; ticketCents?: number; message?: string }) =>
    z.object({
      ventureId: z.string().uuid(),
      ticketCents: z.number().int().min(0).optional(),
      message: z.string().max(2000).optional(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("venture_interests").upsert(
      {
        venture_id: data.ventureId,
        user_id: context.userId,
        ticket_cents: data.ticketCents ?? null,
        message: data.message ?? null,
      },
      { onConflict: "venture_id,user_id" },
    );
    if (error) throw error;
    return { ok: true };
  });