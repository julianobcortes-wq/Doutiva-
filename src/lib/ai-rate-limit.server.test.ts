import { beforeEach, describe, expect, it } from "vitest";
import { __test, enforceAiQuota } from "./ai-rate-limit.server";

const okRpc = { rpc: async () => ({ data: true, error: null }) };

describe("ai-rate-limit", () => {
  beforeEach(() => __test.reset());

  it("blocks after the per-minute limit within one instance", () => {
    const t = 1_000_000;
    const { perMinute } = __test.LIMITS.tutor;
    for (let i = 0; i < perMinute; i++)
      expect(__test.consumeLocal("u1", "tutor", t + i)).toBe(true);
    expect(__test.consumeLocal("u1", "tutor", t + perMinute)).toBe(false);
    expect(__test.consumeLocal("u2", "tutor", t)).toBe(true);
    expect(__test.consumeLocal("u1", "tutor", t + 61_000)).toBe(true);
  });

  it("blocks after the daily limit", () => {
    const { perDay } = __test.LIMITS.preceptor;
    for (let i = 0; i < perDay; i++) {
      expect(__test.consumeLocal("u1", "preceptor", i * 61_000)).toBe(true);
    }
    expect(__test.consumeLocal("u1", "preceptor", perDay * 61_000)).toBe(false);
  });

  it("returns 429 when the database quota refuses", async () => {
    const res = await enforceAiQuota(
      { rpc: async () => ({ data: false, error: null }) },
      "u1",
      "tutor",
    );
    expect(res?.status).toBe(429);
  });

  it("falls back to the local window when the RPC is missing", async () => {
    const missing = { rpc: async () => ({ data: null, error: { code: "PGRST202" } }) };
    expect(await enforceAiQuota(missing, "u1", "cartographer")).toBeNull();
    expect(await enforceAiQuota(okRpc, "u1", "cartographer")).toBeNull();
  });
});
