import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { choosePlan, getMySubscription, listPlans } from "@/lib/billing.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Crown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({
    meta: [
      { title: "Meu plano — Doutiva" },
      {
        name: "description",
        content:
          "Escolha o plano Doutiva. Pagamento com cartão liga-se quando Stripe estiver configurado.",
      },
    ],
  }),
  component: BillingPage,
});

function BillingPage() {
  const qc = useQueryClient();
  const fetchPlans = useServerFn(listPlans);
  const fetchSub = useServerFn(getMySubscription);
  const choose = useServerFn(choosePlan);
  const { data: plans = [] } = useQuery({ queryKey: ["plans"], queryFn: () => fetchPlans() });
  const { data: sub } = useQuery({ queryKey: ["my-sub"], queryFn: () => fetchSub() });
  const mut = useMutation({
    mutationFn: (planId: string) => choose({ data: { planId } }),
    onSuccess: (r) => {
      if (!r?.ok) return toast.error(r?.error ?? "Não foi possível ativar o plano");
      toast.success("Plano ativado em período de cortesia.", { description: r.note });
      qc.invalidateQueries({ queryKey: ["my-sub"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const brl = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 pb-28">
      <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Assinatura</span>
      <h1 className="mt-3 font-serif text-4xl">Meu plano</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Preços editáveis no banco (`subscription_plans`). Sem `STRIPE_SECRET_KEY`, ativamos cortesia
        para você validar o produto.
      </p>

      {sub && (
        <div className="mt-8 rounded-sm border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
            <Crown className="h-3 w-3" /> Plano atual
          </div>
          <h2 className="mt-2 font-serif text-3xl">
            {(sub as any).subscription_plans?.name ?? sub.plan_id}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Status <strong className="text-foreground">{sub.status}</strong>
            {sub.current_period_end
              ? ` · válido até ${new Date(sub.current_period_end).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`
              : ""}
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {plans.map((p: any) => (
          <div
            key={p.id}
            className={`flex flex-col rounded-sm border p-6 ${
              p.highlighted ? "border-gold/50 bg-gold/5" : "border-border/60 bg-card"
            }`}
          >
            <h3 className="font-serif text-2xl">{p.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
            <div className="mt-4 font-serif text-3xl text-gold">
              {brl(p.price_cents)}
              <span className="text-sm text-muted-foreground">
                /{p.interval === "year" ? "ano" : "mês"}
              </span>
            </div>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
              {(p.features as string[]).map((f) => (
                <li key={f} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" /> {f}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 rounded-sm"
              disabled={mut.isPending || sub?.plan_id === p.id}
              onClick={() => mut.mutate(p.id)}
            >
              {sub?.plan_id === p.id ? "Plano atual" : "Ativar cortesia"}
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Ao continuar você aceita os{" "}
        <Link to="/termos" className="text-gold underline">
          Termos
        </Link>
        , a{" "}
        <Link to="/privacidade" className="text-gold underline">
          Privacidade
        </Link>{" "}
        e a{" "}
        <Link to="/politica-ia" className="text-gold underline">
          Política de IA
        </Link>
        .
      </p>
    </div>
  );
}
