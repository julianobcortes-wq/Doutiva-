import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCircle2, Sparkles, Calendar, MessageSquare, Rocket } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notificações — Doutiva" }] }),
  component: NotificationsPage,
});

const notifications = [
  { icon: Calendar, title: "Mesa SP · Maio confirmada", body: "Sua presença foi confirmada. Local: Hotel Fasano JK.", time: "há 2 horas", unread: true },
  { icon: Sparkles, title: "Concierge selecionou 3 mentores", body: "Recomendação personalizada disponível.", time: "há 5 horas", unread: true },
  { icon: MessageSquare, title: "Nova resposta em Cirurgia Plástica", body: "Dr. Marcos comentou no seu tópico de precificação.", time: "ontem" },
  { icon: Rocket, title: "Nova venture no deal flow", body: "ClinicaOne abriu Series A com curadoria do board.", time: "ontem" },
  { icon: CheckCircle2, title: "Certificação concluída", body: "Você concluiu Módulo 3 de Médico-CEO.", time: "3 dias" },
];

function NotificationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 pb-24 md:pb-12">
      <header className="flex items-end justify-between border-b border-border/60 pb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Notificações</span>
          <h1 className="mt-2 font-serif text-4xl">Central de avisos</h1>
        </div>
        <button className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-gold">
          Marcar tudo como lido
        </button>
      </header>

      <ul className="mt-8 divide-y divide-border/60 rounded-sm border border-border/60 bg-card">
        {notifications.map((n, i) => (
          <li key={i} className={`flex gap-4 p-5 ${n.unread ? "bg-gold/[0.03]" : ""}`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-gold/30 text-gold">
              <n.icon className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-serif">{n.title}</span>
                {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{n.time}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-3 rounded-sm border border-border/60 bg-card p-5 text-sm text-muted-foreground">
        <Bell className="h-4 w-4 text-gold" />
        Configure preferências em <span className="text-foreground">Configurações</span>.
      </div>
    </div>
  );
}