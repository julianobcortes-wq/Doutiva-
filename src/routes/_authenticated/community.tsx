import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listSpaces } from "@/lib/community.functions";
import { ArrowUpRight, Users } from "lucide-react";

const spacesQuery = { queryKey: ["spaces"], queryFn: () => listSpaces() };

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({ meta: [{ title: "Praça Central — Doutiva" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(spacesQuery),
  component: CommunityPage,
});

function CommunityPage() {
  const { data } = useSuspenseQuery(spacesQuery);
  const spaces = data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-24 md:pb-12">
      <section className="border-b border-border/60 pb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Praça Central</span>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl">O coração social da cidade.</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Comunidades por tema e especialidade: experiências, dúvidas e apoio entre habitantes.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {spaces.map((s) => (
          <Link
            key={s.id}
            to="/community/$slug"
            params={{ slug: s.slug }}
            className="group flex flex-col rounded-sm border border-border/60 bg-card p-6 transition hover:border-gold/40"
          >
            <div className="flex items-start justify-between">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold">{s.specialty}</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-gold" />
            </div>
            <div className="mt-3 font-serif text-2xl">{s.name}</div>
            <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
            <div className="mt-auto flex items-center gap-2 pt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Users className="h-3 w-3" /> {s.members_count} membros
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}