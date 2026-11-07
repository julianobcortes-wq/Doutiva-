import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({
          ok: true,
          service: "doutiva",
          stripe: Boolean(process.env["STRIPE_SECRET_KEY"]),
          openai: Boolean(process.env["OPENAI_API_KEY"]),
          anthropic: Boolean(process.env["ANTHROPIC_API_KEY"]),
          ts: new Date().toISOString(),
        }),
    },
  },
});
