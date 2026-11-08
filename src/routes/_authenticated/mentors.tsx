import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listMentors, requestMentorSession } from "@/lib/mentors.functions";
import { getMentorMatches } from "@/lib/mentor-marketplace.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Star, MapPin, Compass } from "lucide-react";
import { toast } from "sonner";
import { useValleyProfile } from "@/lib/use-city-profile";

const mentorsQuery = { queryKey: ["mentors"], queryFn: () => listMentors() };

export const Route = createFileRoute("/_authenticated/mentors")({
  head: () => ({
    meta: [
      { title: "Médicos Mentores — Doutiva" },
      { name: "description", content: "Experts que sustentam a evolução de outras pessoas: sessões, orientação e experiência real." },
      { property: "og:title", content: "Médicos Mentores — Doutiva" },
      { property: "og:description", content: "Encontre quem já percorreu o caminho que você está começando." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(mentorsQuery),
  component: MentorsPage,
});

function MentorsPage() {
  const { data } = useSuspenseQuery(mentorsQuery);
  const matchFn = useServerFn(getMentorMatches);
  const matches = useQuery({
    queryKey: ["mentor-matches"],
    queryFn: () => matchFn(),
    retry: 0,
  });
  const { profile, hydrated } = useValleyProfile();
  const expert = hydrated && profile.user_class === "valley_expert";
  const mentors = data ?? [];
  const featured = mentors.filter((m) => m.featured);
  const rest = mentors.filter((m) => !m.featured);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-24 md:pb-12">
      <section className="border-b border-border/60 pb-10">
        <span className={`text-[10px] uppercase tracking-[0.3em] ${expert ? "text-sage" : "text-gold"}`}>
          {expert ? "Sua presença pública" : "Médicos Mentores · parceiros"}
        </span>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl">
          {expert ? "Como a cidade encontra você." : "Parceiros para proximidade humana."}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          {expert
            ? "Este é o diretório em que o seu perfil aparece para os médicos alunos. Compare posicionamento, ajuste o seu e acompanhe quem também atua nas suas frentes."
            : "Espaço para listar mentores parceiros e vender mentoria/curso com take rate Doutiva. O EAD continua AI-first — aqui é a fatia humana."}
        </p>
      </section>

      {(matches.data?.length ?? 0) > 0 && (
        <section className="mt-10 border border-primary/20 bg-primary/5 px-5 py-5">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primary">
            <Compass className="h-3.5 w-3.5" /> Matchmaker · do seu mapa
          </div>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {matches.data!.map((m) => (
              <li key={m.mentorId} className="border border-border/50 bg-background px-4 py-3">
                <p className="font-serif text-lg">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.reason}</p>
                <Link
                  to="/mentors/$slug"
                  params={{ slug: m.slug }}
                  className="mt-2 inline-block text-xs text-gold underline"
                >
                  Ver perfil
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Em destaque</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {featured.map((m) => <MentorCard key={m.id} mentor={m} large />)}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Diretório completo</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((m) => <MentorCard key={m.id} mentor={m} />)}
        </div>
      </section>
    </div>
  );
}

type Mentor = Awaited<ReturnType<typeof listMentors>>[number];

function MentorCard({ mentor, large }: { mentor: Mentor; large?: boolean }) {
  const initials = mentor.name.split(" ").slice(0, 2).map((n) => n[0]).join("");
  const rate = (mentor.hourly_rate_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col rounded-sm border border-border/60 bg-card p-6 transition hover:border-gold/40">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-soft font-serif text-lg text-primary-foreground">
          {initials}
        </div>
        <div className="flex-1">
          <div className={`font-serif ${large ? "text-xl" : "text-lg"}`}>{mentor.name}</div>
          <div className="text-xs text-muted-foreground">{mentor.title}</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="rounded-sm border border-border/60 px-2 py-1 text-gold">{mentor.specialty}</span>
        {mentor.location && (
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {mentor.location}</span>
        )}
        <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-gold" /> {Number(mentor.rating).toFixed(1)}</span>
      </div>
      <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{mentor.bio}</p>
      <div className="mt-auto flex items-center justify-between pt-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sessão 1h</div>
          <div className="font-serif text-lg text-gold">{rate}</div>
        </div>
        <RequestSessionDialog mentor={mentor} />
      </div>
    </div>
  );
}

function RequestSessionDialog({ mentor }: { mentor: Mentor }) {
  const requestFn = useServerFn(requestMentorSession);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [preferredAt, setPreferredAt] = useState("");
  const mut = useMutation({
    mutationFn: requestFn,
    onSuccess: () => {
      toast.success("Sessão solicitada. Você receberá uma confirmação.");
      setOpen(false); setTopic(""); setPreferredAt("");
      qc.invalidateQueries({ queryKey: ["mentors"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao solicitar"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">Solicitar sessão</Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border/60">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Sessão com {mentor.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate({ data: { mentorId: mentor.id, topic, preferredAt: preferredAt || undefined } }); }}
              className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tópico</Label>
            <Textarea value={topic} onChange={(e) => setTopic(e.target.value)} required minLength={3} maxLength={500} rows={4}
                      placeholder="Descreva o desafio que você quer trabalhar..."
                      className="mt-2 rounded-sm bg-background border-border" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Data sugerida (opcional)</Label>
            <Input type="datetime-local" value={preferredAt} onChange={(e) => setPreferredAt(e.target.value)}
                   className="mt-2 h-11 rounded-sm bg-background border-border" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mut.isPending}
                    className="w-full h-11 rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
              {mut.isPending ? "Enviando..." : "Solicitar sessão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}