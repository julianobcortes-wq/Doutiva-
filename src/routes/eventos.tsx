import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import heroDoctor from "@/assets/hero-doctor.jpg";
import grainGold from "@/assets/grain-gold.jpg";
import { ArrowUpRight, Sparkles, MapPin, CalendarDays, Shield } from "lucide-react";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos — A Origem · Doutiva" },
      {
        name: "description",
        content:
          "A Origem: o evento de lançamento da Doutiva. Imersão multissensorial para médicos fundadores — ciência, protocolos e o início do instituto.",
      },
      { property: "og:title", content: "A Origem — Evento Doutiva" },
      {
        property: "og:description",
        content:
          "O evento que abre o movimento Doutiva: talk show 360°, jornada cênica e a primeira turma de médicos fundadores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventosPage,
});

const journey = [
  {
    title: "A chegada",
    desc: "Mansão histórica, luz esmeralda nas janelas — o médico deixa a rotina do lado de fora.",
  },
  {
    title: "O túnel",
    desc: "Travessia LED pela galáxia: passagem ritual entre a medicina comum e a de alta performance.",
  },
  {
    title: "Os personagens",
    desc: "DNA, Adão e Eva, Primata e Semente contam a origem da vida — e o espírito da escola.",
  },
  {
    title: "Talk show 360°",
    desc: "Palco em ilha, anéis de luz e conversas sobre ciência, protocolos e a clínica que paga.",
  },
  {
    title: "O convite",
    desc: "Caixa preta, escultura de DNA e passe VIP — o médico fundador entra no movimento.",
  },
  {
    title: "O presente",
    desc: "Kit de despedida para levar a noite para a segunda-feira no consultório.",
  },
];

const pillars = [
  {
    title: "Protocolos com evidência",
    desc: "Peptídeos, longevidade e performance traduzidos em linguagem de consultório — sem hype de indústria.",
  },
  {
    title: "Imersões e formação",
    desc: "A Origem abre a porta. Depois vêm a Semana Doutiva, a mentoria de 12 meses e o Clube.",
  },
  {
    title: "Instituto independente",
    desc: "Toda a receita vem do que o médico paga pela formação. Sem farmácia, lab ou indústria no cap table.",
  },
];

function EventosPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroDoctor}
            alt="Evento A Origem — Doutiva"
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/45 to-background" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-28 md:pb-40 md:pt-36">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-background/60 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-gold backdrop-blur">
            <CalendarDays className="h-3 w-3" /> Eventos · Lançamento
          </span>
          <h1 className="mt-8 max-w-4xl font-serif text-5xl leading-[1.05] md:text-7xl">
            A Origem.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            O evento que abre o movimento Doutiva. Uma noite multissensorial para médicos
            fundadores — ciência, protocolos e o nascimento do Instituto de Medicina e Negócios.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" /> Curitiba
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" /> Convite para médicos fundadores
            </span>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-sm bg-gold px-8 text-primary-foreground hover:bg-gold-soft"
            >
              <Link to="/auth" search={{ mode: "signup" } as never}>
                Quero o convite <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-sm border-border/70 px-8"
            >
              <a href="#jornada">Ver a jornada da noite</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold">O que é</span>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl md:text-5xl">
            Você não entra num curso. Entra no início do instituto.
          </h2>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            Túnel LED, talk show 360°, performance cênica e o lançamento oficial da Doutiva.
            A Origem é a porta de entrada dos médicos fundadores — depois vêm as imersões
            trimestrais, a mentoria e o Clube.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Três pilares</span>
        <h2 className="mt-3 max-w-3xl font-serif text-4xl md:text-5xl">
          O que a noite representa.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <article key={p.title} className="rounded-sm border border-border/60 bg-card p-8">
              <h3 className="font-serif text-2xl">{p.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="jornada"
        className="relative scroll-mt-20 overflow-hidden border-y border-border/60"
        style={{ backgroundImage: `url(${grainGold})`, backgroundSize: "cover" }}
      >
        <div className="absolute inset-0 bg-background/92" />
        <div className="relative mx-auto max-w-7xl px-6 py-28">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold">A jornada</span>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl md:text-5xl">
            Da chegada ao presente de despedida.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Cada etapa da noite foi pensada como um capítulo — do ritual de entrada ao kit que
            volta com você para a clínica.
          </p>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 md:grid-cols-2 lg:grid-cols-3">
            {journey.map((step, i) => (
              <li key={step.title} className="bg-background p-8">
                <span className="font-serif text-3xl text-gold/80">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-serif text-xl">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-10 rounded-sm border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
              <Shield className="h-3.5 w-3.5" /> Escola independente
            </div>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl">
              Feito para médicos. Pago por médicos.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              A Doutiva não tem contrato, patrocínio nem receita de farmácia, laboratório ou
              indústria. A Origem celebra isso: formação e rede entre médicos, sem lounge de produto.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 shrink-0 rounded-sm bg-gold px-8 text-primary-foreground hover:bg-gold-soft"
          >
            <Link to="/auth" search={{ mode: "signup" } as never}>
              Candidatar-me como fundador
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-28 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-gold" />
          <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl md:text-5xl">
            A origem começa aqui.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Crie sua conta, conte sua especialidade e entre na lista dos médicos fundadores para o
            convite da Origem e o acesso antecipado às trilhas.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-sm bg-gold px-10 text-primary-foreground hover:bg-gold-soft"
            >
              <Link to="/auth" search={{ mode: "signup" } as never}>
                Quero o convite
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-sm px-8">
              <Link to="/">Voltar à Doutiva</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
