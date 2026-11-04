import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listEvents, toggleEventRegistration } from "@/lib/events.functions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Users, Clock, CalendarDays } from "lucide-react";
import { toast } from "sonner";

const eventsQuery = { queryKey: ["events"], queryFn: () => listEvents() };

export const Route = createFileRoute("/_authenticated/events/$slug")({
  head: () => ({ meta: [{ title: "Evento — Doutiva" }] }),
  loader: async ({ context, params }) => {
    const events = await context.queryClient.ensureQueryData(eventsQuery);
    const found = (events ?? []).find((e) => e.slug === params.slug);
    if (!found) throw notFound();
    return found;
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="font-serif text-3xl">Evento não encontrado</h1>
      <Link to="/events" className="mt-6 inline-block text-sm text-gold underline">Voltar</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center text-muted-foreground">Erro ao carregar.</div>
  ),
  component: EventDetail,
});

function EventDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(eventsQuery);
  const event = (data ?? []).find((e) => e.slug === slug)!;
  const qc = useQueryClient();
  const toggleFn = useServerFn(toggleEventRegistration);
  const mut = useMutation({
    mutationFn: toggleFn,
    onSuccess: (r) => {
      toast.success(r.registered ? "Inscrição confirmada" : "Inscrição cancelada");
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const fmt = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" });
  const price = event.price_cents === 0
    ? "Cortesia para membros"
    : (event.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-24 md:pb-12">
      <Link to="/events" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-gold">
        <ArrowLeft className="h-3 w-3" /> Events
      </Link>

      <header className="mt-8 border-b border-border/60 pb-10">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">
          {event.kind === "presencial" ? "Presencial" : "Online"}
        </span>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">{event.title}</h1>
        {event.subtitle && <p className="mt-3 text-lg text-muted-foreground">{event.subtitle}</p>}
      </header>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_320px]">
        <div>
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Sobre o encontro</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{event.description}</p>
          </section>

          <section className="mt-10 grid gap-4 sm:grid-cols-3">
            <Stat icon={CalendarDays} label="Início" value={fmt(event.starts_at)} />
            {event.ends_at && <Stat icon={Clock} label="Encerramento" value={fmt(event.ends_at)} />}
            {event.location && <Stat icon={MapPin} label="Local" value={event.location} />}
            {event.capacity && <Stat icon={Users} label="Capacidade" value={`${event.capacity} vagas`} />}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-sm border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Investimento</div>
            <div className="mt-2 font-serif text-2xl text-gold">{price}</div>
            <Button
              onClick={() => mut.mutate({ data: { eventId: event.id } })}
              disabled={mut.isPending}
              className={`mt-5 w-full rounded-sm ${
                event.registered
                  ? "border border-gold/40 bg-transparent text-gold hover:bg-gold/10"
                  : "bg-gold text-primary-foreground hover:bg-gold-soft"
              }`}
            >
              {event.registered ? "Inscrito · Cancelar" : "Inscrever-se"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border/60 bg-card p-4">
      <Icon className="h-4 w-4 text-gold" />
      <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}