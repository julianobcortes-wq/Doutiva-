import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import heroDoctor from "@/assets/hero-doctor.jpg";
import grainGold from "@/assets/grain-gold.jpg";
import { OFFER_TIERS, INDEPENDENCE_LINE } from "@/lib/offer-ladder";
import { ArrowUpRight, Shield, CalendarDays, BookOpen, Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Doutiva — Instituto de Medicina e Negócios" },
      {
        name: "description",
        content:
          "Formação clínica para médicos. Trilha de peptídeos gratuita. Protocolos R$ 297/mês. Independente de indústria.",
      },
      { property: "og:title", content: "Doutiva — Instituto de Medicina e Negócios" },
      {
        property: "og:description",
        content:
          "Sessões guiadas, monografias e casos. Entre na trilha de peptídeos sem cartão.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroDoctor}
            alt=""
            className="h-full w-full scale-105 object-cover object-[center_20%] opacity-55 animate-in fade-in duration-1000"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.13_0.012_260/0.55)_55%,oklch(0.13_0.012_260)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        </div>

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32 md:pb-28 md:pt-40">
          <p className="text-[11px] font-medium uppercase tracking-[0.42em] text-gold animate-in fade-in slide-in-from-bottom-2 duration-700">
            Instituto de Medicina e Negócios
          </p>
          <h1 className="mt-6 max-w-[14ch] font-display text-[clamp(3.5rem,12vw,7.5rem)] font-medium leading-[0.92] tracking-[-0.03em] animate-in fade-in slide-in-from-bottom-3 duration-700">
            Doutiva
          </h1>
          <p className="mt-8 max-w-xl text-lg font-light leading-relaxed text-foreground/85 md:text-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            Protocolos clínicos com evidência — para o médico que decide na segunda-feira.
            Sessão guiada, monografia e caso. Independente de farmácia, lab e indústria.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <Button
              asChild
              size="lg"
              className="h-13 rounded-sm bg-gold px-8 text-base text-primary-foreground hover:bg-gold-soft"
            >
              <Link to="/auth" search={{ mode: "signup" } as never}>
                Começar grátis — Peptídeos
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-13 rounded-sm border-foreground/25 bg-background/30 px-8 backdrop-blur"
            >
              <Link to="/oferta">Ver Protocolos R$ 297</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-card/30">
        <div className="mx-auto grid max-w-7xl divide-y divide-border/50 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            {
              k: "01",
              t: "Sessão clínica",
              d: "Lâminas → pontos-chave → caso. Um circuito por encontro, feito para retenção.",
            },
            {
              k: "02",
              t: "Evidência no texto",
              d: "Monografias ancoradas em fontes primárias. Tutor IA que cita a biblioteca.",
            },
            {
              k: "03",
              t: "Sem indústria",
              d: "Nenhuma receita de farmácia, laboratório ou patrocínio. Só o que o médico paga.",
            },
          ].map((x) => (
            <div key={x.k} className="px-8 py-14 md:px-10">
              <span className="font-display text-sm tracking-[0.3em] text-gold">{x.k}</span>
              <h2 className="mt-4 font-display text-2xl tracking-tight md:text-3xl">{x.t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="protocolos"
        className="relative scroll-mt-20 overflow-hidden"
        style={{ backgroundImage: `url(${grainGold})`, backgroundSize: "cover" }}
      >
        <div className="absolute inset-0 bg-background/93" />
        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold">Acesso</span>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-tight md:text-5xl">
              Peptídeos liberados.
              <br />
              <span className="text-gold">Protocolos</span> abre o restante.
            </h2>
            <p className="mt-6 max-w-lg text-muted-foreground">
              A trilha de peptídeos está completa e disponível sem cartão. Demais trilhas,
              Professores de IA e prioridade no calendário entram com Protocolos.
            </p>
            <ul className="mt-10 space-y-4">
              <li className="flex gap-4 border-l-2 border-gold pl-4">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <div>
                  <div className="font-medium">Trilha Peptídeos</div>
                  <div className="text-sm text-muted-foreground">Acesso imediato · sem cartão</div>
                </div>
              </li>
              <li className="flex gap-4 border-l-2 border-border pl-4">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <div className="font-medium">Catálogo completo + IA</div>
                  <div className="text-sm text-muted-foreground">Protocolos · R$ 297/mês</div>
                </div>
              </li>
            </ul>
            <div className="mt-12 flex flex-wrap gap-3">
              <Button asChild className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
                <Link to="/auth" search={{ mode: "signup" } as never}>
                  Criar conta
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-sm">
                <Link to="/oferta">Detalhes da oferta</Link>
              </Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-sm border border-gold/25 bg-card/80 p-10 shadow-[var(--shadow-elegant)] backdrop-blur">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Protocolos</p>
            <p className="mt-4 font-display text-5xl text-gold">
              R$ 297<span className="text-lg text-muted-foreground">/mês</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Todas as trilhas publicadas, sessão diária, revisão espaçada, Professores de IA e
              acesso antecipado aos eventos.
            </p>
            <Button
              asChild
              className="mt-8 w-full rounded-sm bg-foreground text-background hover:bg-foreground/90"
            >
              <Link to="/auth" search={{ mode: "signup" } as never}>
                Assinar Protocolos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="escada" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-28">
        <span className="text-[10px] uppercase tracking-[0.35em] text-gold">Instituto</span>
        <h2 className="mt-4 max-w-2xl font-display text-4xl tracking-tight md:text-5xl">
          A escada completa — Online agora; o restante no calendário.
        </h2>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {OFFER_TIERS.slice(0, 3).map((tier) => (
            <article
              key={tier.id}
              className={`flex flex-col rounded-sm border p-7 ${
                tier.status === "live"
                  ? "border-gold/40 bg-gradient-to-b from-gold/10 to-transparent"
                  : "border-border/60 bg-card/40"
              }`}
            >
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {tier.statusLabel}
              </span>
              <h3 className="mt-3 font-display text-2xl tracking-tight">{tier.name}</h3>
              <p className="mt-2 font-display text-xl text-gold">
                {tier.price}
                {tier.priceNote ? (
                  <span className="ml-1 text-sm font-sans font-light text-muted-foreground">
                    {tier.priceNote}
                  </span>
                ) : null}
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{tier.blurb}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild variant="outline" className="rounded-sm">
            <Link to="/oferta">
              Escada completa <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-sm text-muted-foreground">
            <Link to="/eventos">
              <CalendarDays className="mr-2 h-4 w-4" /> A Origem
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col gap-6 rounded-sm border border-gold/20 bg-gold/[0.04] p-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
                <Shield className="h-3.5 w-3.5" /> Independência
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                {INDEPENDENCE_LINE}
              </p>
            </div>
            <Button asChild size="lg" className="h-12 shrink-0 rounded-sm bg-gold px-8 text-primary-foreground hover:bg-gold-soft">
              <Link to="/auth" search={{ mode: "signup" } as never}>
                Entrar na Doutiva
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
