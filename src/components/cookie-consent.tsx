import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getConsent, loadMetaPixel, setConsent, trackingEnabled } from "@/lib/tracking";

/** Banner de cookies de medição. Só aparece se houver Pixel configurado e sem escolha anterior. */
export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!trackingEnabled()) return;
    const current = getConsent();
    if (current === "granted") loadMetaPixel();
    else if (current === null) setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies de medição"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border/70 bg-background/95 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Usamos cookies de medição (Meta) para saber quais anúncios trazem médicos à Doutiva. Você
          pode recusar sem perder nada do site.{" "}
          <Link to="/privacidade" className="underline underline-offset-4 hover:text-foreground">
            Privacidade
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setConsent("denied");
              setOpen(false);
            }}
          >
            Recusar
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setConsent("granted");
              setOpen(false);
            }}
          >
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
