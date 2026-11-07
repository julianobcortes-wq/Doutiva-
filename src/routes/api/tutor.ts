import { createFileRoute } from "@tanstack/react-router";
import { handleTutor } from "@/lib/tutor.server";

export const Route = createFileRoute("/api/tutor")({
  server: { handlers: { POST: ({ request }) => handleTutor(request) } },
});
