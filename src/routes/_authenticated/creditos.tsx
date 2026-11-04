import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProgress } from "@/lib/use-progress";
import { Coins, ShoppingBag, Flame, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/creditos")({
  head: () => ({
    meta: [
      { title: "Créditos — Doutiva" },
      {
        name: "description",
        content: "Saldo real de Créditos Doutiva: XP, sequência e resgates no marketplace.",
      },
      { property: "og:title", content: "Créditos — Doutiva" },
      { property: "og:description", content: "Economia médica validada no servidor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreditosPage,
});

type Redemption = {
  id: string;
  created_at: string;
  price_credits: number;
  marketplace_items: { title: string; kind: string } | null;
};

function CreditosPage() {
  const progress = useProgress();
  const [mine, setMine] = useState<Redemption[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("credit_redemptions")
      .select("id,created_at,price_credits,marketplace_items(title,kind)")
      .order("created_at", { ascending: false })
      .limit(30);
    setMine((data as unknown as Redemption[]) ?? []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 pb-28 md:pb-10">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Economia médica
      </span>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">Seus Créditos.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Saldo conferido no banco. Ganhos vêm do Caso do Dia e das aulas concluídas; gastos vão para
        o Marketplace.
      </p>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Metric
          icon={Coins}
          label="Saldo"
          value={progress ? String(progress.credits) : "—"}
          hint="Disponível para resgate"
        />
        <Metric
          icon={GraduationCap}
          label="XP clínico"
          value={progress ? String(progress.xp) : "—"}
          hint="Ranking e nível"
        />
        <Metric
          icon={Flame}
          label="Sequência"
          value={progress ? `${progress.streak} dias` : "—"}
          hint="Caso do Dia diário"
        />
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
          <Link to="/marketplace">
            <ShoppingBag className="mr-2 h-4 w-4" /> Abrir Marketplace
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-sm">
          <Link to="/caso-do-dia">Ganhar no Caso do Dia</Link>
        </Button>
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Histórico de resgates</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada linha é um débito real em `credit_redemptions`.
        </p>
        <div className="mt-5 divide-y divide-border/60 rounded-sm border border-border/60 bg-card">
          {mine.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">
              Nenhum resgate ainda. Troque créditos no Marketplace.
            </p>
          )}
          {mine.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="text-sm">{r.marketplace_items?.title ?? "Item"}</div>
                <div className="text-xs text-muted-foreground">
                  {(r.marketplace_items?.kind ?? "resgate").toUpperCase()} ·{" "}
                  {new Date(r.created_at).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="font-serif text-lg text-gold">−{r.price_credits}</div>
                <FulfillmentHint
                  kind={r.marketplace_items?.kind}
                  title={r.marketplace_items?.title}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-sm border border-border/60 bg-card px-4 py-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-gold" /> {label}
      </div>
      <div className="mt-2 font-serif text-3xl text-gold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function FulfillmentHint({ kind, title }: { kind?: string; title?: string | null }) {
  const k = (kind || "").toLowerCase();
  const t = (title || "").toLowerCase();
  let tip = "Resgate registrado";
  if (k.includes("precept") || t.includes("professor")) tip = "Use em Professores de IA";
  else if (k.includes("material") || t.includes("pdf") || t.includes("protocolo"))
    tip = "Material liberado no histórico";
  else if (k.includes("evento") || t.includes("masterclass"))
    tip = "Vaga reservada (confirmação por e-mail em breve)";
  else if (t.includes("desconto") || k.includes("desconto")) tip = "Cupom guardado para assinatura";
  return <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{tip}</div>;
}
