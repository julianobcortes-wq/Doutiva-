import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

/**
 * Web analytics de tráfego (Vercel). Cookieless — não depende do banner Meta.
 * Page views SPA: o SDK React observa mudanças de URL no History API.
 */
export function WebAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
