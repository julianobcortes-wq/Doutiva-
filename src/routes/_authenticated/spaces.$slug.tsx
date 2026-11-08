import { createFileRoute, Link } from "@tanstack/react-router";
import { useValleyProfile } from "@/lib/use-city-profile";
import { brl, cityDistricts, expertSpaceLevels, serviceOffers } from "@/lib/valley-v1";
import { CalendarDays, MapPin, ShieldCheck, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/spaces/$slug")({
  head: () => ({
    meta: [
      { title: "Espaço do Mentor — Doutiva" },
      { name: "description", content: "Consultório digital de um Médico Mentor: serviços, credenciais, agenda e nível do espaço." },
      { property: "og:title", content: "Espaço do Mentor — Doutiva" },
      { property: "og:description", content: "Serviços, credenciais e agenda de um Médico Mentor." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SpacePage,
});

function SpacePage() {
  const { slug } = Route.useParams();
  const { profile } = useValleyProfile();
  const accent = profile.user_class === "valley_expert" ? "text-sage" : "text-gold";
  const offers = serviceOffers.filter((o) => o.expertSlug === slug);
  const main = offers[0];

  if (!main) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-serif text-3xl">Espaço não encontrado</h1>
        <p className="mt-3 text-muted-foreground">Este endereço não existe mais na cidade.</p>
        <Link to="/marketplace" className={`mt-6 inline-block text-[10px] uppercase tracking-[0.25em] ${accent}`}>
          Voltar ao Marketplace
        </Link>
      </div>
    );
  }

  const district = cityDistricts.find((d) => d.id === main.district);
  const level = expertSpaceLevels[1];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 pb-28 md:pb-10">
      <Link to="/marketplace" className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        ← Marketplace
      </Link>

      <section className="mt-4 rounded-sm border border-border/60 bg-card p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{district?.name}</span>
          <span className={`inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] ${accent}`}>
            <ShieldCheck className="h-3 w-3" /> Credenciais verificadas
          </span>
          <span className="rounded-full border border-border/60 px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Espaço nível {level.level} · {level.name}
          </span>
        </div>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">{main.expert}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Espaço profissional dentro da Doutiva. Atendimentos, protocolos e acompanhamento contínuo para médicos alunos.
        </p>
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><Star className={`h-4 w-4 ${accent}`} /> {main.rating.toFixed(1)} de avaliação</span>
          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {main.format}</span>
          <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Agenda aberta esta semana</span>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-sm border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl">Serviços</h2>
          <div className="mt-4 divide-y divide-border/60">
            {offers.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 py-4">
                <span>
                  <span className="block text-sm">{o.name}</span>
                  <span className="text-xs text-muted-foreground">{o.desc}</span>
                </span>
                <span className="text-right">
                  <span className="block text-sm">{brl(o.priceCents)}</span>
                  <span className={`text-[10px] uppercase tracking-[0.2em] ${accent}`}>−{o.lcDiscount} DC</span>
                </span>
              </div>
            ))}
          </div>
          <button className={`mt-6 w-full rounded-sm border px-3 py-2 text-[10px] uppercase tracking-[0.2em] ${
            profile.user_class === "valley_expert" ? "border-sage/40 text-sage hover:bg-sage/10" : "border-gold/40 text-gold hover:bg-gold/10"
          }`}>
            Solicitar atendimento
          </button>
        </div>

        <div className="rounded-sm border border-border/60 bg-card p-6">
          <h3 className="font-serif text-xl">Nível do espaço</h3>
          <p className="mt-1 text-sm text-muted-foreground">{level.desc}</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {level.unlocks.map((u) => <li key={u}>· {u}</li>)}
          </ul>
          <Link to="/marketplace" className={`mt-6 inline-block text-[10px] uppercase tracking-[0.25em] ${accent}`}>
            Ver marketplace
          </Link>
        </div>
      </section>
    </div>
  );
}
