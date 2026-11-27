import { createFileRoute } from "@tanstack/react-router";
import {
  getSupabasePublishableKey,
  getSupabaseServerUrl,
} from "@/integrations/supabase/env.server";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const supabaseUrl = getSupabaseServerUrl();
        const supabaseKey = getSupabasePublishableKey();
        let ok = false;

        if (supabaseUrl && supabaseKey) {
          try {
            const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
              signal: AbortSignal.timeout(4000),
            });
            ok = res.ok;
          } catch {
            ok = false;
          }
        }

        // Provider flags are only for operators holding CRON_SECRET.
        const operator =
          request.headers.has("authorization") && (await authenticateCronRequest(request)) === null;

        return Response.json(
          operator
            ? {
                ok,
                stripe: Boolean(process.env["STRIPE_SECRET_KEY"]),
                openai: Boolean(process.env["OPENAI_API_KEY"]),
                anthropic: Boolean(process.env["ANTHROPIC_API_KEY"]),
              }
            : { ok },
          { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
