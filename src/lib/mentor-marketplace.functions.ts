import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { matchMentor } from "@/lib/brain/matchmaker.server";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Apenas admin");
}

export const listMentorOfferings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { mentorId?: string } = {}) =>
    z.object({ mentorId: z.string().uuid().optional() }).parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    let q = context.supabase
      .from("mentor_offerings")
      .select(
        "id, mentor_id, kind, title, description, price_cents, currency, duration_minutes, course_id, take_rate_bps, active, mentors(name, slug)",
      )
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (data.mentorId) q = q.eq("mentor_id", data.mentorId);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

export const adminUpsertMentorOffering = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id?: string;
    mentorId: string;
    kind: "session" | "course";
    title: string;
    description?: string;
    priceCents: number;
    durationMinutes?: number;
    courseId?: string;
    takeRateBps?: number;
    active?: boolean;
  }) =>
    z
      .object({
        id: z.string().uuid().optional(),
        mentorId: z.string().uuid(),
        kind: z.enum(["session", "course"]),
        title: z.string().min(3).max(200),
        description: z.string().max(4000).optional(),
        priceCents: z.number().int().min(0).max(10_000_000),
        durationMinutes: z.number().int().min(15).max(480).optional(),
        courseId: z.string().uuid().optional(),
        takeRateBps: z.number().int().min(0).max(10000).optional(),
        active: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const row = {
      mentor_id: data.mentorId,
      kind: data.kind,
      title: data.title,
      description: data.description ?? null,
      price_cents: data.priceCents,
      duration_minutes: data.durationMinutes ?? null,
      course_id: data.courseId ?? null,
      take_rate_bps: data.takeRateBps ?? 2000,
      active: data.active ?? true,
    };
    if (data.id) {
      const { error } = await context.supabase.from("mentor_offerings").update(row).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    }
    const { data: created, error } = await context.supabase
      .from("mentor_offerings")
      .insert(row)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return { id: created?.id };
  });

/** Purchase offering — Stripe when configured, else courtesy RPC (take rate ledger). */
export const purchaseMentorOffering = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { offeringId: string }) =>
    z.object({ offeringId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: offering, error } = await context.supabase
      .from("mentor_offerings")
      .select("*")
      .eq("id", data.offeringId)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    if (!offering) throw new Error("Oferta indisponível");

    const { stripeConfigured, createStripeCheckoutSession } = await import("@/lib/stripe.server");
    // One-time payment via Checkout when Stripe is up — using subscription helper is wrong;
    // keep courtesy path as primary until dedicated price IDs exist.
    if (stripeConfigured() && process.env["STRIPE_MENTOR_PRICE_DEFAULT"]) {
      try {
        const origin = process.env["APP_ORIGIN"] || "https://www.doutiva.com.br";
        const session = await createStripeCheckoutSession({
          planId: "mentor_offering",
          userId: context.userId,
          successUrl: `${origin}/mentors/${(offering as any).mentor_id}?bought=1`,
          cancelUrl: `${origin}/mentors`,
        });
        return { ok: true, mode: "stripe" as const, url: session.url };
      } catch (e) {
        console.warn("mentor stripe fallback to courtesy", e);
      }
    }

    const { data: result, error: rpcErr } = await context.supabase.rpc(
      "complete_mentor_purchase_courtesy" as never,
      {
        _offering_id: data.offeringId,
        _user_id: context.userId,
      } as never,
    );
    if (rpcErr) throw new Error(rpcErr.message);
    const r = result as { ok?: boolean; error?: string; purchase_id?: string; platform_fee_cents?: number };
    if (!r?.ok) throw new Error(r?.error || "Falha na compra");
    return {
      ok: true,
      mode: "courtesy" as const,
      purchaseId: r.purchase_id,
      platformFeeCents: r.platform_fee_cents,
    };
  });

export const getMentorMatches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return matchMentor(context.supabase as never, context.userId, 3);
  });

export const listMyMentorPurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mentor_purchases")
      .select(
        "id, amount_cents, platform_fee_cents, mentor_net_cents, take_rate_bps, status, created_at, paid_at, mentor_offerings(title, kind), mentors(name, slug)",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  });
