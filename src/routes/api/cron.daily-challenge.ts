import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cron/daily-challenge")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env["CRON_SECRET"] || process.env["LOVABLE_CRON_SECRET"];
        const auth = request.headers.get("authorization") || "";
        if (!secret || auth !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: prefs } = await supabaseAdmin
          .from("notification_prefs")
          .select("user_id, email, daily_case_email")
          .eq("daily_case_email", true)
          .limit(500);

        const { loadDailyCases, caseIndexForDate, toPublicDailyCase } =
          await import("@/lib/daily-case");
        const cases = await loadDailyCases(supabaseAdmin as any);
        const today = toPublicDailyCase(cases[caseIndexForDate(new Date(), cases.length)]);

        let queued = 0;
        let emailed = 0;
        for (const p of prefs ?? []) {
          const payload = {
            case_key: today.key,
            title: today.c.title,
            vignette: today.c.vignette.slice(0, 400),
            question: today.c.question,
            link: "/caso-do-dia",
          };
          await supabaseAdmin.from("daily_challenge_dispatch").insert({
            user_id: p.user_id,
            case_key: today.key,
            channel: "email",
            status: "queued",
            payload,
          });
          queued++;

          const to = p.email;
          const resend = process.env["RESEND_API_KEY"];
          if (to && resend) {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resend}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: process.env["RESEND_FROM"] || "Doutiva <noreply@doutiva.app>",
                to,
                subject: `Caso do Dia — ${today.c.title}`,
                text: `${today.c.vignette}\n\n${today.c.question}\n\nAbra: ${process.env["APP_ORIGIN"] || "https://doutiva.app"}/caso-do-dia`,
              }),
            });
            if (res.ok) {
              emailed++;
              await supabaseAdmin
                .from("daily_challenge_dispatch")
                .update({ status: "sent" })
                .eq("user_id", p.user_id)
                .eq("case_key", today.key)
                .eq("status", "queued");
            }
          }
        }

        return Response.json({
          ok: true,
          case_key: today.key,
          queued,
          emailed,
          note: resendHint(),
        });
      },
    },
  },
});

function resendHint() {
  return process.env["RESEND_API_KEY"]
    ? "E-mails enviados via Resend quando endereço estava cadastrado."
    : "Fila gravada em daily_challenge_dispatch. Configure RESEND_API_KEY + CRON_SECRET para envio.";
}
