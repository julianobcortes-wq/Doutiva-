import { createFileRoute } from "@tanstack/react-router";
import { Copy, DollarSign, Users, Link2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/affiliates")({
  head: () => ({ meta: [{ title: "Afiliados — Doutiva" }] }),
  component: AffiliatesPage,
});

function AffiliatesPage() {
  const link = "https://doutiva.com.br/?ref=medico";

  function copy() {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 pb-24 md:pb-12">
      <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Programa de afiliados</span>
      <h1 className="mt-3 font-serif text-4xl">Indique. Receba. Multiplique.</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Membros Doutiva recebem comissão recorrente sobre cada novo médico aprovado por indicação,
        além de bônus por marcos do indicado dentro do ecossistema.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card icon={Users} label="Indicados ativos" value="14" sub="3 este mês" />
        <Card icon={DollarSign} label="Comissão acumulada" value="R$ 38.420" sub="liberados" />
        <Card icon={Link2} label="Cliques no link" value="612" sub="conv. 9,4%" />
      </div>

      <section className="mt-10 rounded-sm border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Seu link exclusivo</div>
        <div className="mt-3 flex items-center gap-3 rounded-sm border border-border/60 bg-background px-4 py-3">
          <code className="flex-1 text-sm font-mono text-foreground">{link}</code>
          <button
            onClick={copy}
            className="flex items-center gap-2 rounded-sm bg-gold px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-primary-foreground hover:bg-gold-soft"
          >
            <Copy className="h-3.5 w-3.5" /> Copiar
          </button>
        </div>
      </section>

      <section className="mt-10 rounded-sm border border-border/60 bg-card p-6">
        <h2 className="font-serif text-xl">Estrutura de comissão</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            { tier: "Tier 1", pct: "20%", label: "Sobre a primeira anuidade do indicado" },
            { tier: "Tier 2", pct: "10%", label: "Recorrência anual enquanto ativo" },
            { tier: "Bônus", pct: "R$ 2.000", label: "A cada 5 aprovações no semestre" },
          ].map((c) => (
            <div key={c.tier} className="rounded-sm border border-border/60 p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{c.tier}</div>
              <div className="mt-2 font-serif text-3xl text-gold">{c.pct}</div>
              <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Card({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-sm border border-border/60 bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-sm border border-gold/30 text-gold">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      </div>
      <div className="mt-4 font-serif text-3xl">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}