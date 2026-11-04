import { createFileRoute, Link } from "@tanstack/react-router";
import { useValleyProfile } from "@/lib/use-city-profile";
import { useValleyGame } from "@/lib/use-valley-game";
import { RewardHistory, ValleyWallet } from "@/components/valley/game-ui";
import { nonPurchasable } from "@/lib/economy";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({
    meta: [
      { title: "Carteira e Pontos Doutiva — Doutiva" },
      { name: "description", content: "Saldo, origem e histórico dos seus Pontos Doutiva, com regras claras de uso, validade e cancelamento." },
      { property: "og:title", content: "Carteira e Pontos Doutiva — Doutiva" },
      { property: "og:description", content: "Transparência total entre pontos conquistados, adquiridos e promocionais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const { profile } = useValleyProfile();
  const { state } = useValleyGame();
  const accent = profile.user_class === "valley_expert" ? "sage" : "gold";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-28 md:pb-10">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Economia da Doutiva</span>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">Sua carteira.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        O dinheiro amplia possibilidades. A evolução precisa ser conquistada — e aqui você vê exatamente de onde vem cada ponto.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ValleyWallet wallet={state.wallet} accent={accent} />
        <div className="rounded-sm border border-dashed border-border/70 bg-card/40 p-6">
          <h3 className="font-serif text-xl">Nunca comprável</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {nonPurchasable.map((n) => <li key={n}>· {n}</li>)}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Pontos Doutiva não são criptomoeda, não têm promessa de valorização e não podem ser sacados ou negociados entre usuários.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-2xl">Histórico</h2>
          <Link to="/store" className={`text-[10px] uppercase tracking-[0.25em] ${accent === "sage" ? "text-sage" : "text-gold"}`}>
            Ir para as lojas
          </Link>
        </div>
        <div className="mt-6"><RewardHistory transactions={state.transactions} /></div>
      </section>
    </div>
  );
}
