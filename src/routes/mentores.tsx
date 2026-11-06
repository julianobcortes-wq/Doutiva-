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
          "Marketplace de mentoria médica Doutiva: fique perto de quem já opera o método. Em breve — primeiros mentores em formação.",
      },
      { property: "og:title", content: "Mentores — Doutiva" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: MentoresPublicPage,
});

const placeholders = [
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
        <span className="inline-flex items-center gap-2 rounded-sm border border-border/70 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Em breve · marketplace
        </span>
        <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">
          Mentores. O aluno perto do médico.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A mentoria Doutiva nasce como marketplace: primeiros mentores, turmas e sessões 1:1.
          Enquanto isso, o Online (Protocolos) já forma a base — e o evento de março aproxima a
          comunidade.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild size="lg" className="h-12 rounded-sm bg-gold px-8 text-primary-foreground hover:bg-gold-soft">
            <Link to="/auth" search={{ mode: "signup" } as never}>
              Entrar nos Protocolos <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 rounded-sm px-8">
            <Link to="/auth" search={{ mode: "signup" } as never}>
              Quero mentorar (lista)
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-gold">
            <Users className="h-4 w-4" /> O que vem
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {placeholders.map((p) => (
              <article
                key={p.title}
                className="relative overflow-hidden rounded-sm border border-dashed border-border/70 bg-background/80 p-8"
              >
                <span className="absolute right-4 top-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Em breve
                </span>
                <Stethoscope className="h-5 w-5 text-gold" />
                <h2 className="mt-5 font-serif text-2xl">{p.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-10 rounded-sm border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
              <CalendarDays className="h-3.5 w-3.5" /> Março
            </div>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl">
              A Origem é o primeiro encontro presencial.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Enquanto o marketplace de mentores abre, o evento de lançamento junta fundadores e
              futuros mentores na mesma noite.
            </p>
          </div>
          <Button asChild size="lg" variant="outline" className="h-12 shrink-0 rounded-sm border-gold/40 px-8">
            <a href="/evento">Ver A Origem</a>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
