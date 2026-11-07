import { createFileRoute } from "@tanstack/react-router";

/**
 * Onda 6 — WhatsApp Caso do Dia.
 * Adapter: Meta Cloud API quando WHATSAPP_TOKEN + WHATSAPP_PHONE_ID existem;
 * senão apenas enfileira em daily_challenge_dispatch (channel=whatsapp).
 */
export const Route = createFileRoute("/api/cron/whatsapp-daily")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env["CRON_SECRET"] || process.env["LOVABLE_CRON_SECRET"];
        const auth = request.headers.get("authorization") || "";
        if (!secret || auth !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as any;
        const { data: prefs } = await db
          .from("notification_prefs")
          .select("user_id, whatsapp_opt_in, whatsapp_e164")
          .eq("whatsapp_opt_in", true)
          .limit(500);

        const { pickPersonalDailyCase } = await import(
          "@/lib/brain/preceptor-session.server"
        );
        const { toPublicDailyCase } = await import("@/lib/daily-case");

        const token = process.env["WHATSAPP_TOKEN"];
        const phoneId = process.env["WHATSAPP_PHONE_ID"];
        let queued = 0;
        let sent = 0;

        for (const p of prefs ?? []) {
          if (!p.whatsapp_e164) continue;
          const pick = await pickPersonalDailyCase(db, p.user_id);
          const today = toPublicDailyCase(pick.daily);
          const payload = {
            case_key: today.key,
            title: today.c.title,
            vignette: today.c.vignette.slice(0, 300),
            question: today.c.question,
            link: "/caso-do-dia",
            source: pick.source,
          };
          await db.from("daily_challenge_dispatch").insert({
            user_id: p.user_id,
            case_key: today.key,
            channel: "whatsapp",
            status: "queued",
            payload,
          });
          queued++;

          if (token && phoneId) {
            const text = `Doutiva · Caso do Dia\n\n${today.c.title}\n\n${today.c.vignette.slice(0, 280)}\n\n${today.c.question}\n\nAbra: ${(process.env["APP_ORIGIN"] || "https://www.doutiva.com.br")}/caso-do-dia`;
            const res = await fetch(
              `https://graph.facebook.com/v19.0/${phoneId}/messages`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  messaging_product: "whatsapp",
                  to: String(p.whatsapp_e164).replace(/\D/g, ""),
                  type: "text",
                  text: { body: text },
                }),
              },
            );
            if (res.ok) {
              sent++;
              await db
                .from("daily_challenge_dispatch")
                .update({ status: "sent" })
                .eq("user_id", p.user_id)
                .eq("case_key", today.key)
                .eq("channel", "whatsapp")
                .eq("status", "queued");
            }
          }
        }

        return Response.json({
          ok: true,
          queued,
          sent,
          configured: Boolean(token && phoneId),
        });
      },
    },
  },
});
