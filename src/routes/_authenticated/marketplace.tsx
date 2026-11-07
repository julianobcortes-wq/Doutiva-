import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProgress, refreshProgress } from "@/lib/use-progress";
import { listEntitlements } from "@/lib/entitlements.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — Doutiva" },
      {
        name: "description",
        content:
          "Troque Créditos por sessões, protocolos, masterclasses e cupons — com entitlement real.",
      },
    ],
  }),
  component: MarketplacePage,
});

type Item = {
  id: string;
  title: string;
  description: string;
  kind: string;
  price_credits: number;
  stock: number | null;
};

function MarketplacePage() {
  const progress = useProgress();
  const qc = useQueryClient();
  const fetchEnt = useServerFn(listEntitlements);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const { data: entitlements = [] } = useQuery({
    queryKey: ["entitlements"],
    queryFn: () => fetchEnt(),
  });

  const load = useCallback(async () => {
    const { data: it } = await supabase
      .from("marketplace_items")
      .select("id,title,description,kind,price_credits,stock")
      .eq("active", true)
      .order("price_credits");
    setItems((it as Item[]) ?? []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function redeem(item: Item) {
    setBusy(item.id);
    const { data, error } = await supabase.rpc("redeem_item", { _item_id: item.id });
    setBusy(null);
    const r = data as { ok: boolean; error?: string; fulfillment?: Record<string, unknown> } | null;
    if (error || !r?.ok) return toast.error(r?.error ?? "Não foi possível resgatar");
    const route = String(r.fulfillment?.route ?? "/creditos");
    toast.success(`Resgatado: ${item.title}`, {
      description: "Entitlement ativo — abra em Meus benefícios.",
      action: { label: "Abrir", onClick: () => (window.location.href = route) },
    });
    refreshProgress();
    load();
    qc.invalidateQueries({ queryKey: ["entitlements"] });
  }

  const balance = progress?.credits ?? 0;
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 pb-28 md:pb-10">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Marketplace
      </span>
      <h1 className="mt-3 text-4xl font-light md:text-5xl">Troque seus Créditos.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Cada resgate gera um benefício utilizável (sessão, protocolo, reserva ou cupom). Saldo:{" "}
        <strong className="text-foreground">{balance} Créditos</strong>.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((o) => {
          const short = balance < o.price_credits;
          return (
            <div
              key={o.id}
              className="flex flex-col rounded-sm border border-border/60 bg-card p-6"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {o.kind}
              </span>
              <h2 className="mt-3 text-xl font-light">{o.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{o.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="text-lg">{o.price_credits} Créditos</span>
                <Button size="sm" disabled={short || busy === o.id} onClick={() => redeem(o)}>
                  {short
                    ? `Faltam ${o.price_credits - balance}`
                    : busy === o.id
                      ? "Resgatando…"
                      : "Resgatar"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-14 text-2xl font-light">Meus benefícios</h2>
      <div className="mt-4 divide-y divide-border/40 rounded-sm border border-border/60 bg-card">
        {entitlements.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">Nenhum entitlement ativo ainda.</p>
        )}
        {entitlements.map((e) => {
          const payload = e.payload || {};
          const href = String(payload.route || "/creditos");
          const slug = payload.document_slug ? String(payload.document_slug) : null;
          const coupon = payload.coupon_code ? String(payload.coupon_code) : null;
          return (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div>
                <div className="text-sm">{e.title}</div>
                <div className="text-xs text-muted-foreground">
                  {entitlementKindLabel(e.kind)}
                  {e.status === "active" ? " · ativo" : e.status === "used" ? " · usado" : ""}
                  {coupon ? ` · cupom ${coupon}` : ""}
                  {e.expires_at
                    ? ` · expira ${new Date(e.expires_at).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`
                    : ""}
                </div>
              </div>
              {slug ? (
                <Button asChild size="sm" variant="outline" className="rounded-sm">
                  <Link to="/protocolo/$slug" params={{ slug }}>
                    Abrir protocolo
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline" className="rounded-sm">
                  <Link to={href as "/professores"}>
                    {href.includes("professor") ? "Usar sessão" : "Abrir"}
                  </Link>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function entitlementKindLabel(kind: string) {
  switch (kind) {
    case "material":
      return "Material";
    case "session":
      return "Sessão";
    case "coupon":
      return "Cupom";
    case "masterclass":
      return "Masterclass";
    default:
      return "Benefício";
  }
}
