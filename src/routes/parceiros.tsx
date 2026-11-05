import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { INDEPENDENCE_LINE } from "@/lib/offer-ladder";
import { ArrowUpRight, Percent, Megaphone, Handshake } from "lucide-react";

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Parceiros — Doutiva" },
      {
        name: "description",
        content:
          "Médicos parceiros: campanhas que levam alunos ao que você já ensina. Take rate transparente. Em breve.",
      },
      { property: "og:title", content: "Parceiros — Doutiva" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ParceirosPage,
});

const pillars = [
  {
    icon: Megaphone,
    title: "Campanha Doutiva",
    desc: "A escola gera demanda qualificada de médicos. Você continua dono do seu curso e da sua marca.",
  },
  {
    icon: Handshake,
    title: "Seu produto, sua entrega",
    desc: "Sem exclusividade de tema. Quem quer aprofundar na sua técnica é encaminhado a você.",
  },
  {
    icon: Percent,
    title: "Take rate",
    desc: "Percentual sobre o que o aluno compra de você via Doutiva. Tabela aprovada em assembleia — operação em breve.",
  },
];

function ParceirosPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-28">
        <span className="inline-flex items-center gap-2 rounded-sm border border-border/70 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Em breve
        </span>
        <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">
          Médicos parceiros. Take rate sobre o que você já vende.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A Doutiva traz outros médicos até você. Você vende o método que já opera; a escola cobra
          um percentual transparente e não toma o seu curso. Campanhas e repasse entram depois do
          Online e do primeiro evento.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild size="lg" className="h-12 rounded-sm bg-gold px-8 text-primary-foreground hover:bg-gold-soft">
            <Link to="/auth" search={{ mode: "signup" } as never}>
              Quero ser avisado <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 rounded-sm px-8">
            <Link to="/oferta">Ver a escada Doutiva</Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="rounded-sm border border-border/60 bg-background p-8">
              <Icon className="h-5 w-5 text-gold" />
              <h2 className="mt-5 font-serif text-2xl">{title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="font-serif text-3xl md:text-4xl">O que já está na modelagem</h2>
        <ul className="mt-8 space-y-4 text-muted-foreground">
          <li className="border-l border-gold/40 pl-4">
            Indicação à imersão: percentual sobre o aluno que o sócio/parceiro traz.
          </li>
          <li className="border-l border-gold/40 pl-4">
            Mentoria e imersão Doutiva: remuneração por trabalho (tabela própria) — separado do take
            rate do curso do parceiro.
          </li>
          <li className="border-l border-gold/40 pl-4">
            {INDEPENDENCE_LINE}
          </li>
        </ul>
        <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
          Esta página é o mapa. Cadastro de campanha, contrato e painel de repasse abrem quando o
          Online e a comunidade estiverem rodando — marque interesse no cadastro.
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
