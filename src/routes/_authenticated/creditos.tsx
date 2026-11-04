import { createFileRoute, Link } from "@tanstack/react-router";
import { useValleyProfile } from "@/lib/use-city-profile";
import { useValleyGame } from "@/lib/use-valley-game";
import { lfcNeverBuys, lfcSourceLabel, lfcUses, serviceOffers, brl } from "@/lib/valley-v1";
import { Coins } from "lucide-react";

export const Route = createFileRoute("/_authenticated/creditos")({
  head: () => ({
    meta: [
      { title: "Créditos — Doutiva" },
      { name: "description", content: "A moeda interna da Doutiva: como conquistar, onde usar e o que ela nunca compra." },
      { property: "og:title", content: "Créditos — Doutiva" },
      { property: "og:description", content: "Saldo, extrato e regras da moeda virtual da Doutiva." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LifeCoinPage,
});

function LifeCoinPage() {
  const { profile } = useValleyProfile();
  const { state } = useValleyGame();
  const expert = profile.user_class === "valley_expert";
  const accent = expert ? "text-sage" : "text-gold";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-28 md:pb-10">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Economia</span>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">Créditos.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        A moeda que circula dentro da cidade. Conquistada por evolução real, gasta em serviços, experiências e personalização.
      </p>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-sm border border-border/60 bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Coins className={`h-4 w-4 ${accent}`} /> Saldo disponível
            </span>
            <span className={`font-serif text-3xl ${accent}`}>
              {state.lifer_coins.toLocaleString("pt-BR")} <span className="text-base">DC</span>
            </span>
          </div>
          <div className="mt-6 divide-y divide-border/60">
            {state.lfc_ledger.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-4 py-3">
                <span>
                  <span className="block text-sm">{e.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {lfcSourceLabel[e.source]} · {e.detail || "—"} · {e.created_at}
                  </span>
                </span>
                <span className={`font-serif text-lg ${e.amount >= 0 ? accent : "text-muted-foreground"}`}>
                  {e.amount >= 0 ? "+" : ""}{e.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-sm border border-border/60 bg-card p-6">
            <h3 className="font-serif text-xl">Onde usar</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {lfcUses.map((u) => <li key={u}>· {u}</li>)}
            </ul>
          </div>
          <div className="rounded-sm border border-dashed border-border/70 bg-card/40 p-6">
            <h3 className="font-serif text-xl">O que DC nunca compra</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {lfcNeverBuys.map((n) => <li key={n}>· {n}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Resgates disponíveis</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {serviceOffers.slice(0, 3).map((o) => (
            <Link
              key={o.id}
              to="/spaces/$slug"
              params={{ slug: o.expertSlug }}
              className="rounded-sm border border-border/60 bg-card p-6 transition hover:border-border"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{o.expert}</span>
              <div className="mt-2 font-serif text-lg">{o.name}</div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{brl(o.priceCents)}</span>
                <span className={accent}>−{o.lcDiscount} DC</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
