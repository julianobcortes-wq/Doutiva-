import { createFileRoute } from "@tanstack/react-router";
import {
  getSupabasePublishableKey,
  getSupabaseServerUrl,
} from "@/integrations/supabase/env.server";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const supabaseUrl = getSupabaseServerUrl();
        const supabaseKey = getSupabasePublishableKey();
        let auth: "ok" | "down" | "unconfigured" = "unconfigured";
        let authMs: number | null = null;

        if (supabaseUrl && supabaseKey) {
          const started = Date.now();
          try {
            const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
              signal: AbortSignal.timeout(4000),
            });
            authMs = Date.now() - started;
            auth = res.ok ? "ok" : "down";
          } catch {
            authMs = Date.now() - started;
            auth = "down";
          }
        }

        const ok = auth === "ok";
        return Response.json(
          {
            ok,
            service: "doutiva",
            auth,
            authMs,
            supabaseHost: (() => {
              try {
                return new URL(supabaseUrl).hostname;
              } catch {
                return null;
              }
            })(),
            stripe: Boolean(process.env["STRIPE_SECRET_KEY"]),
            openai: Boolean(process.env["OPENAI_API_KEY"]),
            anthropic: Boolean(process.env["ANTHROPIC_API_KEY"]),
            ts: new Date().toISOString(),
          },
          { status: ok ? 200 : 503 },
        );
      },
    },
  },
});
