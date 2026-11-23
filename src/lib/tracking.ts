/**
 * Medição de campanhas (Meta Pixel) com consentimento (LGPD).
 *
 * - O Pixel só carrega depois que a pessoa aceita cookies de medição no banner.
 * - Sem META_PIXEL_ID preenchido, tudo aqui vira no-op: o site funciona igual.
 * - Nunca envie dado de saúde, CRM, e-mail ou telefone nos eventos.
 */

/** ID do conjunto de dados (Pixel) da conta Doutiva no Gerenciador de Eventos da Meta. */
export const META_PIXEL_ID = "";

const CONSENT_KEY = "doutiva_cookie_consent_v1";
const UTM_KEY = "doutiva_utm_v1";
const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type ConsentState = "granted" | "denied" | null;

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: unknown;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

function safeGet(storage: "local" | "session", key: string): string | null {
  try {
    return (storage === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: "local" | "session", key: string, value: string) {
  try {
    (storage === "local" ? window.localStorage : window.sessionStorage).setItem(key, value);
  } catch {
    /* navegação privada ou storage bloqueado: segue sem persistir */
  }
}

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  const v = safeGet("local", CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

export function setConsent(value: Exclude<ConsentState, null>) {
  if (typeof window === "undefined") return;
  safeSet("local", CONSENT_KEY, value);
  if (value === "granted") loadMetaPixel();
}

export function trackingEnabled() {
  return Boolean(META_PIXEL_ID);
}

/** Carrega o Pixel (snippet oficial da Meta) uma única vez, só com consentimento. */
export function loadMetaPixel() {
  if (typeof window === "undefined" || !META_PIXEL_ID) return;
  if (getConsent() !== "granted" || window.fbq) return;

  const fbq: Fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue!.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("init", META_PIXEL_ID);
  fbq("track", "PageView");
}

/** Evento padrão da Meta. Sem parâmetros pessoais. */
export function trackMeta(event: "PageView" | "ViewContent" | "Lead" | "CompleteRegistration") {
  if (typeof window === "undefined" || !window.fbq || getConsent() !== "granted") return;
  window.fbq("track", event);
}

/** Guarda os UTMs da primeira página da sessão para gravar no cadastro. */
export function captureUtm() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  for (const k of UTM_FIELDS) {
    const v = params.get(k);
    if (v) found[k] = v.slice(0, 120);
  }
  if (Object.keys(found).length > 0) safeSet("session", UTM_KEY, JSON.stringify(found));
}

export function getUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const raw = safeGet("session", UTM_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const k of UTM_FIELDS) if (typeof parsed[k] === "string") out[k] = parsed[k] as string;
    return out;
  } catch {
    return {};
  }
}
