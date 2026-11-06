import { createFileRoute } from "@tanstack/react-router";

const EVENT_URL = "/evento/index.html";

export const Route = createFileRoute("/evento")({
  head: () => ({
    meta: [
      { title: "A Origem — Evento Doutiva" },
      {
        name: "description",
        content:
          "A Origem: o evento de lançamento da Doutiva. Imersão multissensorial para médicos fundadores — ciência, protocolos e o início do instituto.",
      },
      { property: "og:title", content: "A Origem — Evento Doutiva" },
      {
        property: "og:description",
        content:
          "O evento que abre o movimento Doutiva: talk show 360°, jornada cênica e a primeira turma de médicos fundadores.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/origem/assets/gen/img0.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { "http-equiv": "refresh", content: `0;url=${EVENT_URL}` } as never,
    ],
    scripts: [
      {
        children: `location.replace(${JSON.stringify(EVENT_URL)});`,
      },
    ],
  }),
  component: function EventoRedirect() {
    if (typeof window !== "undefined") {
      window.location.replace(EVENT_URL);
    }
    return null;
  },
});
