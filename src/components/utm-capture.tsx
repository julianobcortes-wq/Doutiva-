import { useEffect } from "react";
import { captureUtm } from "@/lib/tracking";

/** Captura UTMs em qualquer entrada (home, /auth, /oferta, /medicos, …). */
export function UtmCapture() {
  useEffect(() => {
    captureUtm();
  }, []);
  return null;
}
