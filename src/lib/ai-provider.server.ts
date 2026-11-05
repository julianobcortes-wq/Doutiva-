import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

const RUN = "X-Lovable-AIG-Run-ID";

/**
 * Central AI provider factory.
 * Prefer OPENAI_API_KEY + api.openai.com; Lovable gateway remains a fallback.
 */
function gatewayBaseUrl() {
  if (process.env["AI_GATEWAY_BASE_URL"]) return process.env["AI_GATEWAY_BASE_URL"];
  if (process.env["OPENAI_API_KEY"]) return "https://api.openai.com/v1";
  return "https://ai.gateway.lovable.dev/v1";
}

function isLovableGateway(baseURL: string) {
  return baseURL.includes("lovable.dev");
}

function isOpenAIDirect(baseURL: string) {
  return baseURL.includes("api.openai.com");
}

/** True when talking to api.openai.com (no Lovable reasoning extras). */
export function usesOpenAIDirect() {
  return isOpenAIDirect(gatewayBaseUrl());
}

const _base = gatewayBaseUrl();
export const DEFAULT_CHAT_MODEL =
  process.env["DOUTIVA_CHAT_MODEL"] ||
  (isOpenAIDirect(_base) ? "gpt-4.1-mini" : "openai/gpt-6-astra");
export const DEFAULT_EMBED_MODEL =
  process.env["DOUTIVA_EMBED_MODEL"] ||
  (isOpenAIDirect(_base) ? "text-embedding-3-small" : "google/gemini-embedding-2");

/**
 * Language model for chat/tutor/preceptor.
 * Lovable path keeps Responses + reasoning; OpenAI direct uses Chat Completions.
 */
export function doutivaChatModel(provider: OpenAIProvider = createGatewayOpenAI()) {
  if (usesOpenAIDirect()) return provider(DEFAULT_CHAT_MODEL);
  return provider.responses(DEFAULT_CHAT_MODEL);
}

/** Provider options only valid on Lovable / reasoning-capable Responses models. */
export function doutivaOpenAIProviderOptions(effort: "low" | "medium" | "high" = "medium") {
  if (usesOpenAIDirect()) return undefined;
  return {
    openai: {
      store: false,
      forceReasoning: true,
      reasoningEffort: effort,
      reasoningSummary: "auto" as const,
      include: ["reasoning.encrypted_content"],
    },
  };
}

export function requireAiApiKey() {
  const key = process.env["OPENAI_API_KEY"] || process.env["ANTHROPIC_API_KEY"] || process.env["LOVABLE_API_KEY"];
  if (!key) throw Object.assign(new Error("IA não configurada"), { status: 500 });
  return key;
}

export function createGatewayOpenAI() {
  const apiKey = requireAiApiKey();
  const baseURL = gatewayBaseUrl();
  const lovable = isLovableGateway(baseURL);
  let runId: string | undefined;

  return createOpenAI({
    baseURL,
    apiKey,
    headers: lovable
      ? { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" }
      : undefined,
    fetch: async (input, init) => {
      const h = new Headers(init?.headers);
      if (lovable && runId) h.set(RUN, runId);
      const res = await fetch(input, { ...init, headers: h });
      if (lovable) runId ??= res.headers.get(RUN) ?? undefined;
      if (!res.ok) {
        const text = await res.clone().text().catch(() => "");
        throw Object.assign(new Error(text || `Erro ${res.status}`), { status: res.status });
      }
      return res;
    },
  });
}

/** True when a first-party Anthropic key is present (Claude for treatise writing). */
export function hasAnthropicDirect() {
  return Boolean(process.env["ANTHROPIC_API_KEY"]);
}

/**
 * Anthropic client.
 * Prefer ANTHROPIC_API_KEY → api.anthropic.com.
 * Lovable gateway only when no Anthropic key and gateway is Lovable.
 */
export function createGatewayAnthropic() {
  const anthropicKey = process.env["ANTHROPIC_API_KEY"];
  if (anthropicKey) {
    return createAnthropic({
      apiKey: anthropicKey,
      // Default Anthropic API host — do NOT route through OpenAI base URL.
    });
  }

  const apiKey = requireAiApiKey();
  const baseURL = gatewayBaseUrl();
  const lovable = isLovableGateway(baseURL);
  return createAnthropic({
    baseURL,
    apiKey,
    headers: lovable
      ? { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" }
      : undefined,
  });
}

/** Models for dual-provider raise-bar (OpenAI structure + Claude treatise). */
export function doutivaClaudeTreatiseModel() {
  return process.env["DOUTIVA_CLAUDE_TREATISE_MODEL"] || "claude-opus-4-5";
}

export function doutivaClaudeAuditModel() {
  return process.env["DOUTIVA_CLAUDE_AUDIT_MODEL"] || "claude-haiku-4-5";
}
