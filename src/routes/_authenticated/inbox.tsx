import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMentorSessions, respondMentorSession } from "@/lib/mentors.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Inbox as InboxIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox de mentoria — Doutiva" },
      {
        name: "description",
        content: "Solicitações de mentoria humana: aceitar, agendar ou recusar.",
      },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  const qc = useQueryClient();
  const list = useServerFn(listMentorSessions);
  const respond = useServerFn(respondMentorSession);
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["mentor-sessions"],
    queryFn: () => list(),
  });
  const mut = useMutation({
    mutationFn: (input: {
      id: string;
      status: "accepted" | "declined" | "completed";
      scheduledAt?: string;
      notes?: string;
    }) => respond({ data: input }),
    onSuccess: () => {
      toast.success("Solicitação atualizada.");
      qc.invalidateQueries({ queryKey: ["mentor-sessions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const incoming = sessions.filter((s) => s.mine_as_mentor);
  const outgoing = sessions.filter((s) => s.mine_as_student);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 pb-28">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Mentoria humana
      </span>
      <h1 className="mt-3 font-serif text-4xl">Inbox</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Pedidos reais de sessão com Médicos Mentores — sem threads fictícias.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Para você responder</h2>
        <div className="mt-4 space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {!isLoading && incoming.length === 0 && (
            <Empty text="Nenhuma solicitação dirigida ao seu perfil de mentor." />
          )}
          {incoming.map((s) => (
            <div key={s.id} className="rounded-sm border border-border/60 bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.status}
                  </div>
                  <h3 className="mt-1 font-serif text-xl">{s.topic}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Preferência:{" "}
                    {s.preferred_at
                      ? new Date(s.preferred_at).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })
                      : "sem data"}
                  </p>
                </div>
                {s.status === "requested" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="rounded-sm"
                      disabled={mut.isPending}
                      onClick={() =>
                        mut.mutate({
                          id: s.id,
                          status: "accepted",
                          scheduledAt: new Date(Date.now() + 3 * 864e5).toISOString(),
                          notes: "Horário provisório — confirme por e-mail.",
                        })
                      }
                    >
                      Aceitar (+3 dias)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-sm"
                      disabled={mut.isPending}
                      onClick={() =>
                        mut.mutate({
                          id: s.id,
                          status: "declined",
                          notes: "Agenda indisponível nesta semana.",
                        })
                      }
                    >
                      Recusar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Suas solicitações</h2>
        <div className="mt-4 space-y-3">
          {!isLoading && outgoing.length === 0 && (
            <Empty text="Você ainda não pediu mentoria humana." />
          )}
          {outgoing.map((s) => (
            <div key={s.id} className="rounded-sm border border-border/60 bg-card p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {s.mentor_name} · {s.status}
              </div>
              <h3 className="mt-1 font-serif text-xl">{s.topic}</h3>
              {s.scheduled_at && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Agendado:{" "}
                  {new Date(s.scheduled_at).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })}
                </p>
              )}
              {s.mentor_notes && <p className="mt-2 text-sm">{s.mentor_notes}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-sm border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
      <InboxIcon className="h-4 w-4" /> {text}
    </div>
  );
}
