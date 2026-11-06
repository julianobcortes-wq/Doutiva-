import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DOUTIVA · A origem da nova medicina de alta performance" },
      {
        name: "description",
        content:
          "DOUTIVA une biotecnologia, ciência dos peptídeos e um ecossistema de negócios para médicos. Trilha de peptídeos gratuita. Protocolos R$ 297/mês.",
      },
      { property: "og:title", content: "DOUTIVA · A origem da nova medicina de alta performance" },
      {
        property: "og:description",
        content:
          "Biotecnologia, peptídeos e o evento A Origem. Comece grátis na trilha de peptídeos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/origem/assets/gen/img0.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeRedirect,
});

/** Marketing home matches doutiva.com.br — static fidelity build at /origem. */
function HomeRedirect() {
  useEffect(() => {
    window.location.replace("/origem/index.html");
  }, []);
  return (
    <div className="grid min-h-screen place-items-center bg-[#070A10] text-[#EEF4F5]">
      <p className="text-sm tracking-[0.2em] uppercase text-[#8BEBF7]">Doutiva</p>
    </div>
  );
}
