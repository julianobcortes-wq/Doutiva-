/**
 * Per-user quota for paid AI routes. The database RPC `consume_ai_quota`
 * (migration 0028) is authoritative across instances; the in-process window
 * always applies too, so a missing migration or RPC failure still bounds spend.
 */
export type AiBucket = "tutor" | "preceptor" | "cartographer";

const LIMITS: Record<AiBucket, { perMinute: number; perDay: number }> = {
  tutor: { perMinute: 8, perDay: 150 },
  preceptor: { perMinute: 8, perDay: 120 },
  cartographer: { perMinute: 8, perDay: 120 },
};

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const MAX_TRACKED_KEYS = 20_000;
const hits = new Map<string, number[]>();

function consumeLocal(userId: string, bucket: AiBucket, now = Date.now()): boolean {
  const key = `${bucket}:${userId}`;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < DAY);
  const lastMinute = recent.filter((t) => now - t < MINUTE).length;
  const { perMinute, perDay } = LIMITS[bucket];
  if (lastMinute >= perMinute || recent.length >= perDay) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  if (!hits.has(key) && hits.size >= MAX_TRACKED_KEYS) {
    const oldest = hits.keys().next().value;
    if (oldest !== undefined) hits.delete(oldest);
  }
  hits.set(key, recent);
  return true;
}

type RpcClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: unknown }>;
};

let warnedMissingRpc = false;

/** Returns a 429 response when the user is over quota, otherwise null. */
export async function enforceAiQuota(
  supabase: unknown,
  userId: string,
  bucket: AiBucket,
): Promise<Response | null> {
  const tooMany = () =>
    new Response("Limite de uso da IA atingido. Tente novamente em alguns minutos.", {
      status: 429,
      headers: { "Retry-After": "60" },
    });

  if (!consumeLocal(userId, bucket)) return tooMany();

  try {
    const { data, error } = await (supabase as RpcClient).rpc("consume_ai_quota", {
      _bucket: bucket,
    });
    if (error) {
      if (!warnedMissingRpc) {
        warnedMissingRpc = true;
        console.warn("consume_ai_quota unavailable; using in-process AI quota only");
      }
      return null;
    }
    return data === true ? null : tooMany();
  } catch {
    return null;
  }
}

export const __test = { consumeLocal, LIMITS, reset: () => hits.clear() };
