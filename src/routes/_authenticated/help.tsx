import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, MessageCircle, BookOpen, Mail, ListOrdered } from "lucide-react";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({ meta: [{ title: "Suporte — Doutiva" }] }),
  component: HelpPage,
});

const faqs = [
  { q: "Como funciona a renovação do meu plano?", a: "A renovação é anual e privada. O time entra em contato 60 dias antes do vencimento com a proposta personalizada." },
  { q: "Posso convidar meu sócio para a Doutiva?", a: "Sim. Convites passam por curadoria. Solicite via Concierge ou direto ao seu account." },
  { q: "Como solicito uma sessão com mentor fora do diretório?", a: "Abra um chamado pelo Concierge IA descrevendo o perfil desejado — buscamos sob demanda." },
  { q: "Qual a política de cancelamento de eventos?", a: "Cancelamentos até 7 dias antes geram crédito para próximo encontro. Após esse prazo, sem reembolso." },
];

function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 pb-24 md:pb-12">
      <header className="border-b border-border/60 pb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Suporte</span>
        <h1 className="mt-2 font-serif text-4xl">Como podemos ajudar?</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Atendimento exclusivo Doutiva — resposta humana em até 4 horas em dias úteis.
        </p>
      </header>

      <Link
        to="/como-funciona"
        className="mt-8 flex items-start gap-4 rounded-sm border border-gold/40 bg-gold/5 p-5 transition hover:bg-gold/10"
      >
        <span className="grid h-10 w-10 place-items-center rounded-sm border border-gold/40 text-gold">
          <ListOrdered className="h-4 w-4" />
        </span>
        <div>
          <div className="font-serif text-lg text-foreground">Primeira vez? Como funciona</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Mapa → Minha Trilha → Caso do Dia → Universidade. Circuito claro, sem ruído.
          </p>
        </div>
      </Link>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Channel icon={MessageCircle} title="Chat com Concierge" body="Resposta humana imediata para qualquer demanda." />
        <Channel icon={Mail} title="E-mail privado" body="contato@doutiva.com.br" />
        <Channel icon={LifeBuoy} title="WhatsApp do account" body="Disponível para membros Premier." />
      </section>

      <section className="mt-12">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Perguntas frequentes</h2>
        <div className="mt-4 divide-y divide-border/60 rounded-sm border border-border/60 bg-card">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer items-center justify-between font-serif text-base">
                {f.q}
                <span className="text-gold transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10 flex items-center gap-3 rounded-sm border border-border/60 bg-card p-5 text-sm">
        <BookOpen className="h-4 w-4 text-gold" />
        <span className="text-muted-foreground">
          Procurando algo técnico? Consulte a <span className="text-foreground">Central de Conhecimento</span> (em breve).
        </span>
      </section>
    </div>
  );
}

function Channel({ icon: Icon, title, body }: { icon: typeof LifeBuoy; title: string; body: string }) {
  return (
    <div className="rounded-sm border border-border/60 bg-card p-5 transition hover:border-gold/40">
      <span className="grid h-10 w-10 place-items-center rounded-sm border border-gold/30 text-gold">
        <Icon className="h-4 w-4" />
      </span>
      <div className="mt-3 font-serif text-lg">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}