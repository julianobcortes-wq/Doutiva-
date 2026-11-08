import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { OFFER_TIERS, INDEPENDENCE_LINE } from "@/lib/offer-ladder";
import { ArrowUpRight, Shield } from "lucide-react";

export const Route = createFileRoute("/oferta")({
  head: () => ({
    meta: [
      { title: "Oferta — Doutiva" },
      {
        name: "description",
        content:
          "Peptídeos grátis. Protocolos Online R$ 297/mês. Imersão, mentoria, clube e encontros em breve.",
      },
      { property: "og:title", content: "Oferta — Doutiva" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: OfertaPage,
});

function OfertaPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-28">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">A escada</span>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight tracking-tight md:text-6xl">
          Entre pela trilha livre.
          <br />
          <span className="text-gold">Escale com Protocolos.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Peptídeos sem cartão. Protocolos a R$ 297/mês abre o catálogo. Imersão, mentoria, clube e
          encontros entram como <span className="text-foreground">em breve</span> no calendário do
          instituto.
        </p>
      </section>

      <section className="mx-auto max-w-7xl space-y-4 px-6 pb-24">
        {OFFER_TIERS.map((tier) => (
          <article
            key={tier.id}
            className={`grid gap-8 rounded-sm border p-8 md:grid-cols-[1fr_220px] md:items-center ${
              tier.status === "live"
                ? "border-gold/40 bg-gradient-to-br from-gold/10 to-transparent"
                : "border-border/60 bg-card/60"
            }`}
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`text-[10px] uppercase tracking-[0.25em] ${
                    tier.status === "live" ? "text-gold" : "text-muted-foreground"
                  }`}
                >
                  {tier.statusLabel}
                </span>
                {tier.status === "soon" && (
                  <span className="rounded-sm border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Em breve
                  </span>
                )}
              </div>
              <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">{tier.name}</h2>
              <p className="mt-2 font-display text-2xl text-gold">
                {tier.price}
                {tier.priceNote ? (
                  <span className="ml-2 text-base font-sans font-light text-muted-foreground">
                    {tier.priceNote}
                  </span>
                ) : null}
              </p>
              <p className="mt-4 max-w-2xl text-muted-foreground">{tier.blurb}</p>
              <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {tier.features.map((f) => (
                  <li key={f} className="border-l border-gold/30 pl-3">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              {tier.href ? (
                <Button
                  asChild
                  className={`rounded-sm ${
                    tier.status === "live" ? "bg-gold text-primary-foreground hover:bg-gold-soft" : ""
                  }`}
                  variant={tier.status === "live" ? "default" : "outline"}
                >
                  {tier.href === "/auth" ? (
                    <Link to="/auth" search={{ mode: "signup" } as never}>
                      {tier.cta} <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <a href={tier.href}>
                      {tier.cta} <ArrowUpRight className="ml-2 h-4 w-4 inline" />
                    </a>
                  )}
                </Button>
              ) : (
                <Button asChild variant="outline" className="rounded-sm">
                  <Link to="/auth" search={{ mode: "signup" } as never}>
                    {tier.cta}
                  </Link>
                </Button>
              )}
              {tier.status === "soon" && (
                <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Lista · avise-me no cadastro
                </p>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
              <Shield className="h-3.5 w-3.5" /> Independência
            </div>
            <p className="mt-4 text-muted-foreground">{INDEPENDENCE_LINE}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="outline" className="h-12 rounded-sm px-8">
              <Link to="/auth" search={{ mode: "signup" } as never}>
                Começar grátis
              </Link>
            </Button>
            <Button asChild size="lg" className="h-12 rounded-sm bg-gold px-8 text-primary-foreground hover:bg-gold-soft">
              <Link to="/auth" search={{ mode: "signup" } as never}>
                Assinar Protocolos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
