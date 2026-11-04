import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

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
  .inputValidator((d: { planId: string }) =>
    z.object({ planId: z.string().min(1).max(40) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    // Stripe path when configured — otherwise trial/manual activation.
    if (process.env["STRIPE_SECRET_KEY"]) {
      return {
        ok: false as const,
        error:
          "Stripe configurado no servidor, mas o checkout hospedado ainda não foi ligado neste ambiente. Use o período de cortesia (sem STRIPE) ou finalize a integração.",
      };
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
