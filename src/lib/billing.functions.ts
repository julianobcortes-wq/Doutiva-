import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createStripeCheckoutSession, stripeConfigured } from "@/lib/stripe.server";

export const listPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("subscription_plans")
      .select("id, name, tagline, price_cents, interval, features, highlighted")
      .eq("active", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMySubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_subscriptions")
      .select(
        "plan_id, status, provider, current_period_end, updated_at, subscription_plans(name, price_cents, interval)",
      )
      .eq("user_id", context.userId)
      .maybeSingle();
    return data;
  });

export const choosePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { planId: string; origin?: string }) =>
    z.object({ planId: z.string().min(1).max(40), origin: z.string().url().optional() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    if (stripeConfigured()) {
      const { data: user } = await context.supabase.auth.getUser();
      const origin = data.origin || process.env["APP_ORIGIN"] || "http://127.0.0.1:5173";
      try {
        const session = await createStripeCheckoutSession({
          planId: data.planId,
          userId: context.userId,
          email: user.user?.email,
          successUrl: `${origin}/billing?checkout=success`,
          cancelUrl: `${origin}/billing?checkout=cancel`,
        });
        // user_subscriptions only allows SELECT for authenticated — write via service role.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("user_subscriptions").upsert({
          user_id: context.userId,
          plan_id: data.planId,
          status: "pending_payment",
          provider: "stripe",
          provider_ref: session.id,
          updated_at: new Date().toISOString(),
        });
        return { ok: true as const, checkoutUrl: session.url, status: "pending_payment" as const };
      } catch (e) {
        return {
          ok: false as const,
          error: e instanceof Error ? e.message : "Falha no Checkout Stripe",
        };
      }
    }

    const { data: r, error } = await context.supabase.rpc("select_plan", { _plan_id: data.planId });
    if (error) throw new Error(error.message);
    return r as {
      ok: boolean;
      plan_id?: string;
      status?: string;
      current_period_end?: string;
      note?: string;
      error?: string;
    };
  });
