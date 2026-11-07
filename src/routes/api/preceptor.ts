import { createFileRoute } from "@tanstack/react-router";
import { handlePreceptor } from "@/lib/preceptor.server";

export const Route = createFileRoute("/api/preceptor")({
  server: { handlers: { POST: ({ request }) => handlePreceptor(request) } },
});
