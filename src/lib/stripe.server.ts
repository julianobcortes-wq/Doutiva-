/** Stripe Checkout helpers — only active when STRIPE_SECRET_KEY is set. */
import { createHmac, timingSafeEqual } from "node:crypto";

export function stripeConfigured() {
  return Boolean(process.env["STRIPE_SECRET_KEY"]);
}

export async function createStripeCheckoutSession(input: {
  planId: string;
  userId: string;
  email?: string | null;
  successUrl: string;
  cancelUrl: string;
}) {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw Object.assign(new Error("Stripe não configurado"), { status: 501 });

  const priceEnv = `STRIPE_PRICE_${input.planId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  const priceId = process.env[priceEnv] || process.env["STRIPE_PRICE_DEFAULT"];
  if (!priceId) {
    throw Object.assign(
      new Error(`Preço Stripe ausente. Defina ${priceEnv} ou STRIPE_PRICE_DEFAULT.`),
      { status: 501 },
    );
  }

  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("success_url", input.successUrl);
  body.set("cancel_url", input.cancelUrl);
  body.set("client_reference_id", input.userId);
  body.set("metadata[plan_id]", input.planId);
  body.set("metadata[user_id]", input.userId);
  body.set("line_items[0][price]", priceId);
  body.set("line_items[0][quantity]", "1");
  if (input.email) body.set("customer_email", input.email);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
  if (!res.ok || !json.url) {
    throw Object.assign(new Error(json.error?.message || `Stripe ${res.status}`), { status: 502 });
  }
  return { id: json.id!, url: json.url };
}

function verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, ...rest] = p.split("=");
      return [k.trim(), rest.join("=")];
    }),
  ) as { t?: string; v1?: string };
  if (!parts.t || !parts.v1) throw new Error("Assinatura Stripe malformada");

  const ageSec = Math.abs(Math.floor(Date.now() / 1000) - Number(parts.t));
  if (!Number.isFinite(ageSec) || ageSec > 300) throw new Error("Assinatura Stripe expirada");

  const expected = createHmac("sha256", secret).update(`${parts.t}.${rawBody}`, "utf8").digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(parts.v1, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Assinatura Stripe inválida");
}

export async function constructStripeEvent(rawBody: string, signature: string | null) {
  const secret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!secret) throw new Error("Stripe webhook não configurado");
  if (!signature) throw new Error("Assinatura ausente");
  verifyStripeSignature(rawBody, signature, secret);
  return JSON.parse(rawBody) as {
    type: string;
    data: { object: Record<string, unknown> };
  };
}
