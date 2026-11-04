import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProgress, refreshProgress } from "@/lib/use-progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — Doutiva" },
      { name: "description", content: "Troque seus Créditos por sessões com Professores IA, protocolos, masterclasses e descontos." },
      { property: "og:title", content: "Marketplace — Doutiva" },
      { property: "og:description", content: "Seu estudo vira Créditos; seus Créditos viram recursos de carreira." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MarketplacePage,
});

type Item = { id: string; title: string; description: string; kind: string; price_credits: number; stock: number | null };
type Redemption = { id: string; created_at: string; price_credits: number; marketplace_items: { title: string } | null };

function MarketplacePage() {
  const progress = useProgress();
  const [items, setItems] = useState<Item[]>([]);
  const [mine, setMine] = useState<Redemption[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: it }, { data: rd }] = await Promise.all([
      supabase.from("marketplace_items").select("id,title,description,kind,price_credits,stock").eq("active", true).order("price_credits"),
      supabase.from("credit_redemptions").select("id,created_at,price_credits,marketplace_items(title)").order("created_at", { ascending: false }),
    ]);
    setItems((it as Item[]) ?? []);
    setMine((rd as unknown as Redemption[]) ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function redeem(item: Item) {
    setBusy(item.id);
    const { data, error } = await supabase.rpc("redeem_item", { _item_id: item.id });
    setBusy(null);
    const r = data as { ok: boolean; error?: string } | null;
    if (error || !r?.ok) return toast.error(r?.error ?? "Não foi possível resgatar");
    toast.success(`Resgatado: ${item.title}`);
    refreshProgress();
    load();
  }

  const balance = progress?.credits ?? 0;
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 pb-28 md:pb-10">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Marketplace</span>
      <h1 className="mt-3 text-4xl font-light md:text-5xl">Troque seus Créditos.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Créditos vêm do Caso do Dia e das aulas concluídas. Saldo atual: <strong className="text-foreground">{balance} Créditos</strong>.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhum item disponível no momento.</p>}
        {items.map((o) => {
          const short = balance < o.price_credits;
          return (
            <div key={o.id} className="flex flex-col rounded-sm border border-border/60 bg-card p-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{o.kind}</span>
              <h2 className="mt-3 text-xl font-light">{o.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{o.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="text-lg">{o.price_credits} Créditos</span>
                <Button size="sm" disabled={short || busy === o.id} onClick={() => redeem(o)}>
                  {short ? `Faltam ${o.price_credits - balance}` : busy === o.id ? "Resgatando…" : "Resgatar"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-14 text-2xl font-light">Meus resgates</h2>
      <div className="mt-4 rounded-sm border border-border/60 bg-card">
        {mine.length === 0 && <p className="p-6 text-sm text-muted-foreground">Você ainda não resgatou nada.</p>}
        {mine.map((r) => (
          <div key={r.id} className="flex justify-between border-b border-border/40 px-6 py-3 text-sm last:border-b-0">
            <span>{r.marketplace_items?.title ?? "Item"}</span>
            <span className="text-muted-foreground">−{r.price_credits} · {new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
