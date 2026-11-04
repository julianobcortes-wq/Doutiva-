import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listEvents, toggleEventRegistration } from "@/lib/events.functions";
import { Button } from "@/components/ui/button";
import { MapPin, CalendarDays, Users } from "lucide-react";
import { toast } from "sonner";
import { useValleyProfile } from "@/lib/use-city-profile";

const eventsQuery = { queryKey: ["events"], queryFn: () => listEvents() };

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({ meta: [{ title: "Centro de Eventos — Doutiva" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(eventsQuery),
  component: EventsPage,
});

function EventsPage() {
  const { data } = useSuspenseQuery(eventsQuery);
  const { profile, hydrated } = useValleyProfile();
  const expert = hydrated && profile.user_class === "valley_expert";
  const events = data ?? [];
  const qc = useQueryClient();
  const toggleFn = useServerFn(toggleEventRegistration);
  const mut = useMutation({
    mutationFn: toggleFn,
    onSuccess: (r) => {
      toast.success(r.registered ? "Inscrição confirmada" : "Inscrição cancelada");
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  const fmtPrice = (c: number) =>
    c === 0 ? "Cortesia para membros" : (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-24 md:pb-12">
      <section className="border-b border-border/60 pb-10">
        <span className={`text-[10px] uppercase tracking-[0.3em] ${expert ? "text-sage" : "text-gold"}`}>
          {expert ? "Conduzir encontros" : "Centro de Eventos"}
        </span>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl">
          {expert ? "Encontros que você pode conduzir." : "Encontros, desafios e experiências."}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          {expert
            ? "Acompanhe a agenda da cidade, participe como convidado e proponha a sua própria imersão."
            : "Aulas abertas, imersões e desafios coletivos que movimentam a cidade."}
        </p>
      </section>

      <div className="mt-10 space-y-px overflow-hidden rounded-sm border border-border/60 bg-border/60">
        {events.map((e) => (
          <div key={e.id} className="grid gap-6 bg-background p-6 md:grid-cols-[160px_1fr_220px] md:items-center">
            <div className="flex items-start gap-4 md:flex-col md:gap-1">
              <div className="grid h-20 w-20 place-items-center rounded-sm border border-gold/30">
                <CalendarDays className="h-5 w-5 text-gold" />
              </div>
              <div>
                <div className="font-serif text-base">{fmtDate(e.starts_at)}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {e.kind === "presencial" ? "Presencial" : "Online"}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-2xl">{e.title}</h3>
              <p className="text-sm text-muted-foreground">{e.subtitle}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {e.location && (
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>
                )}
                {e.capacity && (
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {e.capacity} vagas</span>
                )}
              </div>
            </div>

            <div className="md:text-right">
              <div className="font-serif text-lg text-gold">{fmtPrice(e.price_cents)}</div>
              <Button
                onClick={() => mut.mutate({ data: { eventId: e.id } })}
                disabled={mut.isPending}
                variant={e.registered ? "outline" : "default"}
                className={`mt-3 w-full md:w-auto rounded-sm ${
                  e.registered
                    ? "border-gold/40 text-gold hover:bg-gold/10"
                    : "bg-gold text-primary-foreground hover:bg-gold-soft"
                }`}
              >
                {e.registered ? "Inscrito · Cancelar" : "Inscrever-se"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}