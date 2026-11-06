import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "A Origem — Doutiva" },
      {
        name: "description",
        content:
          "A Origem: imersão multissensorial e lançamento do ecossistema Doutiva. Biotecnologia, peptídeos e medicina de alta performance.",
      },
      { property: "og:title", content: "A Origem — Doutiva" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: EventosRedirect,
});

/** Serve the fidelity landing at /origem (replica of doutiva.com.br). */
function EventosRedirect() {
  useEffect(() => {
    window.location.replace("/origem/index.html");
  }, []);
  return (
    <div className="grid min-h-screen place-items-center bg-[#070A10] text-[#EEF4F5]">
      <p className="text-sm tracking-[0.2em] uppercase text-[#8BEBF7]">Abrindo A Origem…</p>
    </div>
  );
}
