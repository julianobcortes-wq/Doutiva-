import { createFileRoute } from "@tanstack/react-router";
import { constructStripeEvent } from "@/lib/stripe.server";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const signature = request.headers.get("stripe-signature");
        let event: { type: string; data: { object: Record<string, unknown> } };
        try {
          event = await constructStripeEvent(raw, signature);
        } catch (e) {
          return new Response(e instanceof Error ? e.message : "Webhook inválido", { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
          const obj = event.data.object;
          const userId = String(obj.client_reference_id || (obj.metadata as any)?.user_id || "");
          const planId = String((obj.metadata as any)?.plan_id || "");
          if (userId && planId) {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const periodEnd = new Date();
            periodEnd.setDate(periodEnd.getDate() + (planId === "fundador" ? 365 : 30));
            await supabaseAdmin.from("user_subscriptions").upsert({
              user_id: userId,
              plan_id: planId,
              status: "active",
              provider: "stripe",
              provider_ref: String(obj.id || ""),
              current_period_end: periodEnd.toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }

        return Response.json({ received: true });
      },
    },
  },
});
