/**
 * Medição de campanhas (Meta Pixel) + hooks de produto (PostHog quando houver chave).
 *
 * - O Pixel só carrega depois que a pessoa aceita cookies de medição no banner.
 * - Vercel Analytics / Speed Insights são cookieless e NÃO passam por este módulo.
 * - Sem Pixel ID (env ou fallback), Meta vira no-op: o site funciona igual.
 * - Nunca envie dado de saúde, CRM, e-mail ou telefone nos eventos.
 */

const FALLBACK_META_PIXEL_ID = "999653985998183";

/** ID do Pixel: `VITE_META_PIXEL_ID` em build, senão o ID atual de produção. */
export const META_PIXEL_ID =
  (typeof import.meta !== "undefined" &&
    typeof import.meta.env?.["VITE_META_PIXEL_ID"] === "string" &&
    import.meta.env["VITE_META_PIXEL_ID"].trim()) ||
  FALLBACK_META_PIXEL_ID;

const CONSENT_KEY = "doutiva_cookie_consent_v1";
const UTM_SESSION_KEY = "doutiva_utm_v1";
const UTM_OAUTH_KEY = "doutiva_utm_oauth_v1";
const UTM_FIRST_KEY = "doutiva_utm_first_v1";
const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type ConsentState = "granted" | "denied" | null;

export type MetaStandardEvent = "PageView" | "ViewContent" | "Lead" | "CompleteRegistration";

const pendingMetaEvents: MetaStandardEvent[] = [];

type ConsentListener = () => void;
const consentListeners = new Set<ConsentListener>();

/** Reage a mudanças do banner (ex.: SPA PageView após Aceitar). */
export function subscribeConsent(listener: ConsentListener) {
  consentListeners.add(listener);
  return () => {
    consentListeners.delete(listener);
  };
}

function notifyConsent() {
  for (const l of consentListeners) {
    try {
      l();
    } catch {
      /* ignore */
    }
  }
}

/** Eventos leves de produto — prontos para PostHog; hoje no-op sem chave. */
export type ProductEvent =
  | "interview_started"
  | "trail_viewed"
  | "first_lesson"
  | "interview_completed"
  | "lesson_started";

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
    posthog?: {
      capture: (event: string, props?: Record<string, unknown>) => void;
      init?: (key: string, opts?: Record<string, unknown>) => void;
    };
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

function parseUtm(raw: string | null): Record<string, string> {
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

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  const v = safeGet("local", CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

function safeRemove(storage: "local" | "session", key: string) {
  try {
    (storage === "local" ? window.localStorage : window.sessionStorage).removeItem(key);
  } catch {
    /* ignore */
  }
}

function flushPendingMetaEvents() {
  if (typeof window === "undefined" || !window.fbq || getConsent() !== "granted") return;
  const queued = pendingMetaEvents.splice(0, pendingMetaEvents.length);
  for (const event of queued) {
    window.fbq("track", event);
  }
}

export function setConsent(value: Exclude<ConsentState, null>) {
  if (typeof window === "undefined") return;
  safeSet("local", CONSENT_KEY, value);
  if (value === "granted") {
    loadMetaPixel();
    flushPendingMetaEvents();
  } else {
    pendingMetaEvents.length = 0;
  }
  notifyConsent();
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

/** Evento padrão da Meta. Sem parâmetros pessoais. Enfileira antes do consentimento. */
export function trackMeta(event: MetaStandardEvent) {
  if (typeof window === "undefined" || !META_PIXEL_ID) return;
  const consent = getConsent();
  if (consent === "denied") return;
  if (consent === null) {
    if (event !== "PageView" && !pendingMetaEvents.includes(event)) {
      pendingMetaEvents.push(event);
    }
    return;
  }
  if (!window.fbq) loadMetaPixel();
  window.fbq?.("track", event);
}

/**
 * PageView em navegação SPA (TanStack Router).
 * O carregamento inicial do Pixel já dispara um PageView — use isto só em mudanças de rota.
 */
export function trackSpaPageView() {
  trackMeta("PageView");
}

/**
 * Guarda UTMs da URL:
 * - sessão atual (sessionStorage) — last-touch da sessão
 * - first-touch (localStorage) — só grava se ainda não existir
 * Chamar no root para cobrir home, /auth, /oferta, /medicos, etc.
 */
export function captureUtm() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  for (const k of UTM_FIELDS) {
    const v = params.get(k);
    if (v) found[k] = v.slice(0, 120);
  }
  if (Object.keys(found).length === 0) return;
  safeSet("session", UTM_SESSION_KEY, JSON.stringify(found));
  if (!safeGet("local", UTM_FIRST_KEY)) {
    safeSet("local", UTM_FIRST_KEY, JSON.stringify(found));
  }
}

/**
 * Garante que os UTMs da sessão atual sobrevivam a um redirecionamento OAuth externo
 * mesmo em WebViews móveis que limpam sessionStorage entre domínios.
 */
export function persistUtmForRedirect() {
  if (typeof window === "undefined") return;
  captureUtm();
  const current = getUtm();
  if (Object.keys(current).length > 0) {
    safeSet("local", UTM_OAUTH_KEY, JSON.stringify(current));
  }
}

export function clearRedirectUtm() {
  if (typeof window === "undefined") return;
  safeRemove("local", UTM_OAUTH_KEY);
}

/**
 * UTMs para gravar no cadastro: prioriza a sessão atual; senão OAuth pendente; senão first-touch.
 */
export function getUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const session = parseUtm(safeGet("session", UTM_SESSION_KEY));
  if (Object.keys(session).length > 0) return session;
  const oauth = parseUtm(safeGet("local", UTM_OAUTH_KEY));
  if (Object.keys(oauth).length > 0) return oauth;
  return parseUtm(safeGet("local", UTM_FIRST_KEY));
}

export function getFirstTouchUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return parseUtm(safeGet("local", UTM_FIRST_KEY));
}

function posthogKey(): string {
  if (typeof import.meta === "undefined") return "";
  const k = import.meta.env?.["VITE_POSTHOG_KEY"];
  return typeof k === "string" ? k.trim() : "";
}

/**
 * Evento de produto. Com `VITE_POSTHOG_KEY` + SDK no window, envia ao PostHog.
 * Sem chave: no-op seguro (hooks já instrumentados para a próxima etapa).
 * Nunca inclui PII / clínico.
 */
export function trackProduct(
  event: ProductEvent | (string & {}),
  props?: Record<string, string | number | boolean | null | undefined>,
) {
  if (typeof window === "undefined") return;
  if (!posthogKey() || !window.posthog?.capture) return;
  const clean: Record<string, string | number | boolean> = {};
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === null || v === undefined) continue;
      clean[k] = v;
    }
  }
  try {
    window.posthog.capture(event, clean);
  } catch {
    /* product analytics nunca pode quebrar UX */
  }
}
