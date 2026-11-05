import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import heroDoctor from "@/assets/hero-doctor.jpg";
import grainGold from "@/assets/grain-gold.jpg";
import { OFFER_TIERS, INDEPENDENCE_LINE } from "@/lib/offer-ladder";
import { ArrowUpRight, Shield, CalendarDays, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Doutiva — Instituto de Medicina e Negócios" },
      {
        name: "description",
        content:
          "Protocolos que pagam a clínica. Online a R$ 297/mês; imersão, mentoria e clube em breve. 100% independente de indústria.",
      },
      { property: "og:title", content: "Doutiva — Instituto de Medicina e Negócios" },
      {
        property: "og:description",
        content: "Comece pelos Protocolos. A escada completa do instituto vem em seguida.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const onlineNow = [
  "Sessão guiada: lâminas → chaves → caso",
  "Trilhas com monografia e evidência",
  "Revisão espaçada e Professores de IA",
  "Comunidade de médicos",
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section id="topo" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroDoctor}
            alt="Doutiva"
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-28 md:pb-44 md:pt-36">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-background/60 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-gold backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-gold" /> Instituto · Medicina e Negócios
          </span>
          <h1 className="mt-8 max-w-4xl font-serif text-5xl leading-[1.05] md:text-7xl">
            Doutiva
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Protocolos que pagam a clínica. Começamos pelo Online — R$ 297/mês — e costuramos
            imersão, mentoria e clube em cima da mesma base. Sem farmácia, lab ou indústria.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-sm bg-gold px-8 text-primary-foreground hover:bg-gold-soft"
            >
              <Link to="/auth" search={{ mode: "signup" } as never}>
                Assinar Protocolos <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-sm px-8">
              <Link to="/oferta">Ver a escada completa</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="protocolos" className="scroll-mt-20 border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Disponível agora</span>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Protocolos Online</h2>
            <p className="mt-2 font-serif text-3xl text-gold">
              R$ 297<span className="text-base text-muted-foreground">/mês</span>
            </p>
            <p className="mt-4 text-muted-foreground">
              O EAD que lançamos primeiro: método + evidência + hábito diário. É a porta da
              comunidade e a base digital da Semana Doutiva e da mentoria.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
              {onlineNow.map((line) => (
                <li key={line} className="border-l border-gold/40 pl-4">
                  {line}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-10 rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft"
            >
              <Link to="/auth" search={{ mode: "signup" } as never}>
                Começar agora
              </Link>
            </Button>
          </div>
          <div
            className="relative overflow-hidden rounded-sm border border-border/60 p-10"
            style={{ backgroundImage: `url(${grainGold})`, backgroundSize: "cover" }}
          >
            <div className="absolute inset-0 bg-background/90" />
            <div className="relative">
              <Sparkles className="h-5 w-5 text-gold" />
              <h3 className="mt-4 font-serif text-2xl">Por que Online primeiro</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Trazer os primeiros alunos, validar as trilhas e montar a comunidade antes da
                imersão de março. Mentores e take rate de parceiros entram em seguida — já
                desenhados na oferta.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="escada" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Plano completo</span>
        <h2 className="mt-3 max-w-3xl font-serif text-4xl md:text-5xl">
          A escada do instituto — com “em breve” onde ainda costuramos.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {OFFER_TIERS.slice(0, 3).map((tier) => (
            <article
              key={tier.id}
              className={`rounded-sm border p-6 ${
                tier.status === "live"
                  ? "border-gold/40 bg-gold/5"
                  : "border-border/60 bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {tier.statusLabel}
                </span>
                {tier.status === "soon" && (
                  <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Em breve
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-serif text-2xl">{tier.name}</h3>
              <p className="mt-1 text-gold">
                {tier.price}
                {tier.priceNote ? (
                  <span className="ml-1 text-sm text-muted-foreground">{tier.priceNote}</span>
                ) : null}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{tier.blurb}</p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="outline" className="rounded-sm">
            <Link to="/oferta">
              Ver Imersão, Clube, Encontro e preços <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-3">
          <Link
            to="/eventos"
            className="group rounded-sm border border-border/60 bg-background p-8 transition hover:border-gold/40"
          >
            <CalendarDays className="h-5 w-5 text-gold" />
            <h3 className="mt-5 font-serif text-2xl">A Origem · março</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Primeiro evento presencial. Lista e jornada da noite.
            </p>
            <span className="mt-6 inline-flex items-center text-sm text-gold">
              Ver eventos <ArrowUpRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link
            to="/mentores"
            className="group rounded-sm border border-dashed border-border/70 bg-background p-8 transition hover:border-gold/40"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Em breve</span>
            <h3 className="mt-5 font-serif text-2xl">Mentores</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Marketplace: aluno perto do médico que já opera o método.
            </p>
          </Link>
          <Link
            to="/parceiros"
            className="group rounded-sm border border-dashed border-border/70 bg-background p-8 transition hover:border-gold/40"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Em breve</span>
            <h3 className="mt-5 font-serif text-2xl">Parceiros</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Campanhas + take rate sobre o que o médico parceiro já vende.
            </p>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-sm border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-10">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
            <Shield className="h-3.5 w-3.5" /> Independência
          </div>
          <p className="mt-4 max-w-3xl text-muted-foreground">{INDEPENDENCE_LINE}</p>
        </div>
      </section>

      <section className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-28 text-center">
          <h2 className="mx-auto max-w-3xl font-serif text-4xl md:text-5xl">
            Comece pelos Protocolos.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Crie a conta, entre na primeira trilha e na sessão do dia. O restante da escada abre
            com a comunidade e o evento de março.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-10 h-12 rounded-sm bg-gold px-10 text-primary-foreground hover:bg-gold-soft"
          >
            <Link to="/auth" search={{ mode: "signup" } as never}>
              Assinar Protocolos
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
