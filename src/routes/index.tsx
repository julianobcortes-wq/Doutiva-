import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DOUTIVA · A origem da nova medicina de alta performance" },
      {
        name: "description",
        content:
          "DOUTIVA une biotecnologia, ciência dos peptídeos e um ecossistema de negócios para médicos. Cursos, imersões e o evento A ORIGEM.",
      },
      { property: "og:title", content: "DOUTIVA · A origem da nova medicina de alta performance" },
      {
        property: "og:description",
        content:
          "Biotecnologia avançada, ciência dos peptídeos e um ecossistema de negócios para médicos que querem ir além.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/origem/assets/gen/img0.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { "http-equiv": "refresh", content: "0;url=/origem/index.html" } as never,
    ],
    scripts: [
      {
        children: `location.replace("/origem/index.html");`,
      },
    ],
  }),
  component: function HomeRedirect() {
    if (typeof window !== "undefined") {
      window.location.replace("/origem/index.html");
    }
    return null;
  },
});
