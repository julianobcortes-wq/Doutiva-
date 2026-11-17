import { createOpenAI, type OpenAIProvider } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

/**
 * Central AI provider factory.
 * Prefer OPENAI_API_KEY + api.openai.com; override with AI_GATEWAY_BASE_URL when needed.
 */
function gatewayBaseUrl() {
  if (process.env["AI_GATEWAY_BASE_URL"]) return process.env["AI_GATEWAY_BASE_URL"];
  return "https://api.openai.com/v1";
}

function isOpenAIDirect(baseURL: string) {
  return baseURL.includes("api.openai.com");
}

/** True when talking to api.openai.com. */
export function usesOpenAIDirect() {
  return isOpenAIDirect(gatewayBaseUrl());
}

const _base = gatewayBaseUrl();
export const DEFAULT_CHAT_MODEL =
  process.env["DOUTIVA_CHAT_MODEL"] ||
  (isOpenAIDirect(_base) ? "gpt-4.1-mini" : "gpt-4.1-mini");
export const DEFAULT_EMBED_MODEL =
  process.env["DOUTIVA_EMBED_MODEL"] ||
  (isOpenAIDirect(_base) ? "text-embedding-3-small" : "text-embedding-3-small");

/**
 * Language model for chat/tutor/preceptor.
 * OpenAI direct uses Chat Completions; custom gateways may use Responses.
 */
export function doutivaChatModel(provider: OpenAIProvider = createGatewayOpenAI()) {
  if (usesOpenAIDirect()) return provider(DEFAULT_CHAT_MODEL);
  return provider.responses(DEFAULT_CHAT_MODEL);
}

/** Provider options for reasoning-capable Responses models on custom gateways. */
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
  const key = process.env["OPENAI_API_KEY"] || process.env["ANTHROPIC_API_KEY"];
  if (!key) throw Object.assign(new Error("IA não configurada"), { status: 500 });
  return key;
}

export function createGatewayOpenAI() {
  const apiKey = requireAiApiKey();
  const baseURL = gatewayBaseUrl();

  return createOpenAI({
    baseURL,
    apiKey,
    fetch: async (input, init) => {
      const res = await fetch(input, init);
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
 */
export function createGatewayAnthropic() {
  const anthropicKey = process.env["ANTHROPIC_API_KEY"];
  if (anthropicKey) {
    return createAnthropic({
      apiKey: anthropicKey,
    });
  }

  const apiKey = requireAiApiKey();
  const baseURL = gatewayBaseUrl();
  return createAnthropic({
    baseURL,
    apiKey,
  });
}

/** Models for dual-provider raise-bar (OpenAI structure + Claude treatise). */
export function doutivaClaudeTreatiseModel() {
  return process.env["DOUTIVA_CLAUDE_TREATISE_MODEL"] || "claude-opus-4-5";
}

export function doutivaClaudeAuditModel() {
  return process.env["DOUTIVA_CLAUDE_AUDIT_MODEL"] || "claude-haiku-4-5";
}
