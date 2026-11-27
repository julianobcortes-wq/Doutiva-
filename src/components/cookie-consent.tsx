import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getConsent, loadMetaPixel, setConsent, trackingEnabled } from "@/lib/tracking";

let cookieBannerOpen = false;
const bannerListeners = new Set<(open: boolean) => void>();

function setBannerOpenState(open: boolean) {
  cookieBannerOpen = open;
  for (const listener of bannerListeners) {
    try {
      listener(open);
    } catch {
      /* ignore */
    }
  }
}

export function isCookieBannerOpen(): boolean {
  return cookieBannerOpen;
}

export function subscribeCookieBanner(listener: (open: boolean) => void) {
  bannerListeners.add(listener);
  return () => {
    bannerListeners.delete(listener);
  };
}

/** Banner de cookies de medição. Só aparece se houver Pixel configurado e sem escolha anterior. */
export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!trackingEnabled()) return;
    const current = getConsent();
    if (current === "granted") {
      loadMetaPixel();
      setBannerOpenState(false);
    } else if (current === null) {
      setOpen(true);
      setBannerOpenState(true);
    }
    return () => {
      setBannerOpenState(false);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies de medição"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2 md:gap-4 md:px-6 md:py-4">
        <p className="text-[11px] leading-tight text-muted-foreground md:hidden">
          Usamos cookies para medir os anúncios.{" "}
          <Link to="/privacidade" className="underline underline-offset-4 hover:text-foreground">
            Privacidade
          </Link>
        </p>
        <p className="hidden text-sm text-muted-foreground md:block">
          Usamos cookies de medição (Meta) para saber quais anúncios trazem médicos à Doutiva. A
          contagem de visitas do site (Vercel Analytics) não usa cookies de anúncio. Você pode
          recusar o Pixel sem perder nada do site.{" "}
          <Link to="/privacidade" className="underline underline-offset-4 hover:text-foreground">
            Privacidade
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs md:h-8 md:px-3"
            onClick={() => {
              setConsent("denied");
              setOpen(false);
              setBannerOpenState(false);
            }}
          >
            Recusar
          </Button>
          <Button
            size="sm"
            className="h-7 px-2.5 text-xs md:h-8 md:px-3"
            onClick={() => {
              setConsent("granted");
              setOpen(false);
              setBannerOpenState(false);
            }}
          >
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
