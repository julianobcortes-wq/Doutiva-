import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Send, Pin } from "lucide-react";
import { useValleyProfile } from "@/lib/use-city-profile";

export const Route = createFileRoute("/_authenticated/inbox")({
  head: () => ({ meta: [{ title: "Inbox — Doutiva" }] }),
  component: InboxPage,
});

type Thread = {
  id: string; name: string; role: string; preview: string; time: string;
  unread?: number; pinned?: boolean;
};

const threads: Thread[] = [
  { id: "1", name: "Dra. Helena Vasconcellos", role: "Mentor · M&A em Saúde", preview: "Vamos marcar a sessão para validar a tese de roll-up?", time: "10:42", unread: 2, pinned: true },
  { id: "2", name: "Concierge Doutiva", role: "Curadoria", preview: "Selecionamos 3 mentores para o seu desafio de expansão.", time: "ontem", unread: 1 },
  { id: "3", name: "Círculo Cirurgia Plástica", role: "Comunidade", preview: "Dr. Marcos respondeu no tópico de precificação.", time: "Seg" },
  { id: "4", name: "Mesa SP · Maio", role: "Evento", preview: "Confirme presença até quinta-feira.", time: "20/05" },
  { id: "5", name: "Doutiva Ventures", role: "Deal flow", preview: "Nova rodada disponível: ClinicaOne Series A.", time: "18/05" },
];

function InboxPage() {
  const [active, setActive] = useState(threads[0]);
  const [draft, setDraft] = useState("");
  const { profile, hydrated } = useValleyProfile();
  const expert = hydrated && profile.user_class === "valley_expert";

  return (
    <div className="mx-auto h-[calc(100vh-4rem)] max-w-7xl px-6 py-6 pb-24 md:pb-6">
      <div className="grid h-full gap-6 md:grid-cols-[340px_1fr]">
        <aside className="flex flex-col rounded-sm border border-border/60 bg-card">
          <div className="border-b border-border/60 p-4">
            <span className={`text-[10px] uppercase tracking-[0.3em] ${expert ? "text-sage" : "text-gold"}`}>
              {expert ? "Solicitações" : "Inbox"}
            </span>
            <h1 className="mt-1 font-serif text-2xl">{expert ? "Quem procurou você" : "Conversas"}</h1>
            <div className="mt-4 flex items-center gap-2 rounded-sm border border-border/60 bg-background px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input placeholder="Buscar..." className="flex-1 bg-transparent text-sm outline-none" />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setActive(t)}
                  className={`w-full border-b border-border/40 p-4 text-left transition ${
                    active.id === t.id ? "bg-secondary/60" : "hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {t.pinned && <Pin className="h-3 w-3 text-gold" />}
                        <span className="font-serif text-sm">{t.name}</span>
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t.role}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{t.time}</div>
                  </div>
                  <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{t.preview}</p>
                  {t.unread && (
                    <span className="mt-2 inline-block rounded-full bg-gold/20 px-2 py-0.5 text-[10px] text-gold">
                      {t.unread} novas
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex flex-col rounded-sm border border-border/60 bg-card">
          <header className="border-b border-border/60 p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-soft font-serif text-primary-foreground">
                {active.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="font-serif text-lg">{active.name}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{active.role}</div>
              </div>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <Msg from={active.name} body={active.preview} time={active.time} />
            <Msg from="Você" mine body="Combinado. Pode mandar uma proposta de horários para terça?" time="hoje" />
          </div>

          <div className="border-t border-border/60 p-4">
            <div className="flex items-center gap-2 rounded-sm border border-border/60 bg-background px-3 py-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escreva uma mensagem..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button className="grid h-8 w-8 place-items-center rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Msg({ from, body, time, mine }: { from: string; body: string; time: string; mine?: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] rounded-sm border p-3 ${mine ? "border-gold/30 bg-gold/5" : "border-border/60 bg-background"}`}>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{from} · {time}</div>
        <p className="mt-1 text-sm">{body}</p>
      </div>
    </div>
  );
}