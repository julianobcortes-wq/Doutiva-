import { createFileRoute, redirect } from "@tanstack/react-router";

/** Alias público: "Universidade" no produto aponta para /academy. */
export const Route = createFileRoute("/universidade")({
  beforeLoad: () => {
    throw redirect({ to: "/academy" });
  },
});
