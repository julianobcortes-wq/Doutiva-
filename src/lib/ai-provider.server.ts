import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

const RUN = "X-Lovable-AIG-Run-ID";

/**
 * Central AI provider factory.
 * Today defaults to Lovable AI Gateway; set AI_GATEWAY_BASE_URL + OPENAI_API_KEY
 * (or keep LOVABLE_API_KEY) to point elsewhere without touching call sites.
 */
export function requireAiApiKey() {
  const key = process.env["LOVABLE_API_KEY"] || process.env["OPENAI_API_KEY"] || process.env["ANTHROPIC_API_KEY"];
  if (!key) throw Object.assign(new Error("IA não configurada"), { status: 500 });
  return key;
}

export function createGatewayOpenAI() {
  const apiKey = requireAiApiKey();
  const baseURL = process.env["AI_GATEWAY_BASE_URL"] || "https://ai.gateway.lovable.dev/v1";
  const isLovable = baseURL.includes("lovable.dev");
  let runId: string | undefined;

  return createOpenAI({
    baseURL,
    apiKey,
    headers: isLovable
      ? { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" }
      : undefined,
    fetch: async (input, init) => {
      const h = new Headers(init?.headers);
      if (isLovable && runId) h.set(RUN, runId);
      const res = await fetch(input, { ...init, headers: h });
      if (isLovable) runId ??= res.headers.get(RUN) ?? undefined;
      if (!res.ok) {
        const text = await res.clone().text().catch(() => "");
        throw Object.assign(new Error(text || `Erro ${res.status}`), { status: res.status });
      }
      return res;
    },
  });
}

export function createGatewayAnthropic() {
  const apiKey = requireAiApiKey();
  const baseURL = process.env["AI_GATEWAY_BASE_URL"] || "https://ai.gateway.lovable.dev/v1";
  const isLovable = baseURL.includes("lovable.dev");
  return createAnthropic({
    baseURL,
    apiKey,
    headers: isLovable
      ? { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" }
      : undefined,
  });
}

export const DEFAULT_CHAT_MODEL = process.env["DOUTIVA_CHAT_MODEL"] || "openai/gpt-6-astra";
export const DEFAULT_EMBED_MODEL = process.env["DOUTIVA_EMBED_MODEL"] || "google/gemini-embedding-2";
