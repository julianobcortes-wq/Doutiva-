import { createFileRoute } from "@tanstack/react-router";

/** Legacy plural path — keep bookmarks working. */
const CANONICAL = "/evento";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "A Origem — Evento Doutiva" },
      { "http-equiv": "refresh", content: `0;url=${CANONICAL}` } as never,
    ],
    scripts: [
      {
        children: `location.replace(${JSON.stringify(CANONICAL)});`,
      },
    ],
  }),
  component: function EventosRedirect() {
    if (typeof window !== "undefined") {
      window.location.replace(CANONICAL);
    }
    return null;
  },
});
