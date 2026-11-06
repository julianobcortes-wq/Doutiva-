import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { constructStripeEvent, stripeConfigured } from "./stripe.server";

describe("stripe.server", () => {
  afterEach(() => {
    delete process.env["STRIPE_SECRET_KEY"];
    delete process.env["STRIPE_WEBHOOK_SECRET"];
  });

  it("stripeConfigured reflete a env", () => {
    expect(stripeConfigured()).toBe(false);
    process.env["STRIPE_SECRET_KEY"] = "sk_test_x";
    expect(stripeConfigured()).toBe(true);
  });

  it("valida assinatura do webhook", async () => {
    const secret = "whsec_test";
    process.env["STRIPE_WEBHOOK_SECRET"] = secret;
    const body = JSON.stringify({
      type: "checkout.session.completed",
      data: { object: { id: "cs_test" } },
    });
    const t = Math.floor(Date.now() / 1000);
    const v1 = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
    const event = await constructStripeEvent(body, `t=${t},v1=${v1}`);
    expect(event.type).toBe("checkout.session.completed");
  });

  it("rejeita assinatura inválida", async () => {
    process.env["STRIPE_WEBHOOK_SECRET"] = "whsec_test";
    await expect(
      constructStripeEvent("{}", "t=1,v1=deadbeef"),
    ).rejects.toThrow(/Assinatura|expirada|inválida/);
  });
});
