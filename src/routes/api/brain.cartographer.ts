import { createFileRoute } from "@tanstack/react-router";
import { handleCartographer } from "@/lib/brain/cartographer.server";

export const Route = createFileRoute("/api/brain/cartographer")({
  server: {
    handlers: {
      POST: ({ request }) => handleCartographer(request),
    },
  },
});
