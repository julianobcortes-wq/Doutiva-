import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MKT_HUB_PUBLISHABLE_KEY, MKT_HUB_URL, paginaRastreavel } from "@/lib/mkt-hub";

/**
 * Conta visitas ao site de forma anônima: sem cookie, sem dado pessoal.
 * Guarda só a página, a origem da visita (UTMs ou site de onde veio) e o tipo de aparelho.
 * A sessão é um número aleatório que vive apenas enquanto a aba está aberta (sessionStorage).
 */
const SESSAO_KEY = "dtv_sessao";
const ORIGEM_KEY = "dtv_origem";

type Origem = {
  origem: string;
  meio: string;
  campanha: string;
  conteudo: string;
  termo: string;
  referrer_host: string;
};

function corta(v: string | null | undefined, max: number): string {
  return (v ?? "").trim().slice(0, max);
}

function lerSessao(): string {
  try {
    let s = sessionStorage.getItem(SESSAO_KEY);
    if (!s) {
      s = crypto.randomUUID().replace(/-/g, "");
      sessionStorage.setItem(SESSAO_KEY, s);
    }
    return s;
  } catch {
    return crypto.randomUUID().replace(/-/g, "");
  }
}

function lerOrigem(): Origem {
  try {
    const salva = sessionStorage.getItem(ORIGEM_KEY);
    if (salva) return JSON.parse(salva) as Origem;
  } catch {
    // segue sem origem salva
  }
  const p = new URLSearchParams(window.location.search);
  let referrer = "";
  try {
    const host = document.referrer ? new URL(document.referrer).hostname : "";
    referrer = host && host !== window.location.hostname ? host : "";
  } catch {
    referrer = "";
  }
  const origem: Origem = {
    origem: corta(p.get("utm_source"), 80),
    meio: corta(p.get("utm_medium"), 80),
    campanha: corta(p.get("utm_campaign"), 120),
    conteudo: corta(p.get("utm_content"), 120),
    termo: corta(p.get("utm_term"), 120),
    referrer_host: corta(referrer, 120),
  };
  try {
    sessionStorage.setItem(ORIGEM_KEY, JSON.stringify(origem));
  } catch {
    // sem sessionStorage: a origem vale só para esta página
  }
  return origem;
}

function dispositivo(): "celular" | "computador" | "tablet" {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "celular";
  return "computador";
}

export function VisitTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ultima = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !paginaRastreavel(pathname)) return;
    if (ultima.current === pathname) return;
    ultima.current = pathname;
    const corpo = {
      sessao: lerSessao(),
      pagina: corta(pathname, 200),
      dispositivo: dispositivo(),
      ...lerOrigem(),
    };
    void fetch(`${MKT_HUB_URL}/rest/v1/mkt_visitas`, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: MKT_HUB_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(corpo),
    }).catch(() => {
      // contagem de visitas nunca pode atrapalhar o site
    });
  }, [pathname]);

  return null;
}
