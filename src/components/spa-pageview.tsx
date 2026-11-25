import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getConsent, subscribeConsent, trackSpaPageView } from "@/lib/tracking";

/**
 * Dispara Meta PageView em cada mudança de rota (SPA), só com consentimento.
 * O PageView do loadMetaPixel cobre a URL atual no momento do Aceitar / reload;
 * aqui só as navegações seguintes.
 */
export function SpaPageView() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const [consent, setConsent] = useState<ReturnType<typeof getConsent>>(() =>
    typeof window === "undefined" ? null : getConsent(),
  );
  const primed = useRef(false);
  const last = useRef<string | null>(null);

  useEffect(() => subscribeConsent(() => setConsent(getConsent())), []);

  useEffect(() => {
    if (typeof window === "undefined" || consent !== "granted") return;

    const key = `${pathname}${search ?? ""}`;
    if (!primed.current) {
      // URL atual já contou (ou vai contar) no init do Pixel.
      primed.current = true;
      last.current = key;
      return;
    }
    if (last.current === key) return;
    last.current = key;
    trackSpaPageView();
  }, [pathname, search, consent]);

  return null;
}
