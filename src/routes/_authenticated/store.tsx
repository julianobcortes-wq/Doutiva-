import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useValleyProfile } from "@/lib/use-city-profile";
import { useValleyGame } from "@/lib/use-valley-game";
import { LifePointsBalance, RewardReveal, StoreItemCard } from "@/components/valley/game-ui";
import { productsFor, stores, type StoreId } from "@/lib/economy";

export const Route = createFileRoute("/_authenticated/store")({
  head: () => ({
    meta: [
      { title: "Lojas Doutiva — Doutiva" },
      { name: "description", content: "Conhecimento, experiências, evolução, personalização, tecnologia e serviços de Médicos Mentores com preços claros." },
      { property: "og:title", content: "Lojas Doutiva — Doutiva" },
      { property: "og:description", content: "Seis lojas dentro da jornada, com preço em moeda real e em Pontos Doutiva." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const { profile } = useValleyProfile();
  const { state } = useValleyGame();
  const [store, setStore] = useState<StoreId | "todas">("todas");
  const [reveal, setReveal] = useState<{ title: string; detail: string } | null>(null);
  const accent = profile.user_class === "valley_expert" ? "sage" : "gold";
  const products = productsFor(profile.user_class, store === "todas" ? undefined : store);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-28 md:pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Lojas Doutiva</span>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">O que amplia sua jornada.</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Compras ampliam possibilidades — nunca substituem evolução. Nível, reputação e certificação continuam sendo conquistados.
          </p>
        </div>
        <LifePointsBalance wallet={state.wallet} accent={accent} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {[{ id: "todas" as const, name: "Todas" }, ...stores].map((s) => (
          <button
            key={s.id}
            onClick={() => setStore(s.id as StoreId | "todas")}
            className={`rounded-full border px-4 py-1.5 text-xs transition ${
              store === s.id
                ? accent === "sage" ? "border-sage bg-sage/10 text-sage" : "border-gold bg-gold/10 text-gold"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <StoreItemCard
            key={p.id}
            product={p}
            accent={accent}
            onAcquire={(prod) =>
              setReveal({
                title: prod.name,
                detail: "Antes de confirmar você verá preço, duração, renovação, benefícios, restrições e política de cancelamento.",
              })
            }
          />
        ))}
      </div>

      <RewardReveal
        open={!!reveal}
        title={reveal?.title ?? ""}
        detail={reveal?.detail ?? ""}
        rewards={["Sem cobrança surpresa", "Sem item aleatório pago"]}
        accent={accent}
        onClose={() => setReveal(null)}
      />
    </div>
  );
}
