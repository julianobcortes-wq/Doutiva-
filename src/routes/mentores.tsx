import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Users, Stethoscope, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/mentores")({
  head: () => ({
    meta: [
      { title: "Mentores — Doutiva" },
      {
        name: "description",
        content:
          "Marketplace de mentoria médica Doutiva: parceiros reais, sessões 1:1 e take rate transparente. O EAD continua AI-first — aqui é a fatia humana.",
      },
      { property: "og:title", content: "Mentores — Doutiva" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: MentoresPublicPage,
});

const offerings = [
  {
    title: "Mentoria clínica de protocolo",
    desc: "Acompanhar implantação na carteira — emagrecimento, massa, longevidade.",
  },
  {
    title: "Mentoria de gestão da clínica",
    desc: "Precificação, programa de 12 meses e indicadores que pagam a mentoria.",
  },
  {
    title: "Sessões avulsas",
    desc: "1:1 com médico mentor via marketplace — agenda e take rate Doutiva.",
  },
];

function MentoresPublicPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-28">
        <span className="inline-flex items-center gap-2 rounded-sm border border-gold/40 bg-gold/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-gold">
          Marketplace · parceiros ativos
        </span>
        <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">
          Mentores. O aluno perto do médico.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Mentores parceiros, match pelo seu mapa clínico e sessões 1:1 com take rate Doutiva.
          O centro do campus continua AI-first — a mentoria é a fatia humana.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild size="lg" className="h-12 rounded-sm bg-gold px-8 text-primary-foreground hover:bg-gold-soft">
            <Link to="/auth">
              Entrar e ver mentores <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 rounded-sm px-8">
            <Link to="/auth">
              Quero mentorar
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-gold">
            <Users className="h-4 w-4" /> O que você encontra
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {offerings.map((p) => (
              <article
                key={p.title}
                className="relative overflow-hidden rounded-sm border border-border/70 bg-background/80 p-8"
              >
                <Stethoscope className="h-5 w-5 text-gold" />
                <h2 className="mt-5 font-serif text-2xl">{p.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <CalendarDays className="h-4 w-4" /> Como funciona
        </div>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Entre no campus, abra Médicos Mentores, veja o matchmaker a partir do seu mapa e solicite
          a sessão. No piloto, a compra courtesy registra take rate; Stripe entra quando o price ID
          estiver configurado.
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
