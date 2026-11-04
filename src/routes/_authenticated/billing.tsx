import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Download, CreditCard, Crown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({ meta: [{ title: "Faturamento — Doutiva" }] }),
  component: BillingPage,
});

const invoices = [
  { id: "INV-0421", date: "01/05/2026", value: "R$ 2.400,00", status: "Pago" },
  { id: "INV-0398", date: "01/04/2026", value: "R$ 2.400,00", status: "Pago" },
  { id: "INV-0376", date: "01/03/2026", value: "R$ 2.400,00", status: "Pago" },
];

function BillingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-24 md:pb-12">
      <header className="border-b border-border/60 pb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Faturamento</span>
        <h1 className="mt-2 font-serif text-4xl">Plano e cobranças</h1>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="rounded-sm border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
            <Crown className="h-3 w-3" /> Plano atual
          </div>
          <h2 className="mt-2 font-serif text-3xl">Membro Fundador</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesso completo ao ecossistema Doutiva · renovação anual privada.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border/40 pt-5 text-xs">
            <Stat label="Mensalidade" value="R$ 2.400" />
            <Stat label="Próxima cobrança" value="01/06/2026" />
            <Stat label="Método" value="Cartão •••• 4421" />
          </div>
        </div>

        <div className="rounded-sm border border-border/60 bg-card p-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Status</div>
          <div className="mt-2 inline-flex items-center gap-2 text-sm text-gold">
            <CheckCircle2 className="h-4 w-4" /> Em dia
          </div>
          <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-gold/40 px-3 py-2 text-xs uppercase tracking-[0.2em] text-gold hover:bg-gold/10">
            <CreditCard className="h-3.5 w-3.5" /> Atualizar cartão
          </button>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Histórico</h2>
        <div className="mt-4 overflow-hidden rounded-sm border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Fatura</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Valor</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {invoices.map((i) => (
                <tr key={i.id} className="bg-card">
                  <td className="px-4 py-3 font-mono text-xs">{i.id}</td>
                  <td className="px-4 py-3">{i.date}</td>
                  <td className="px-4 py-3 text-gold">{i.value}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">{i.status}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex items-center gap-1 text-xs text-gold hover:underline">
                      <Download className="h-3 w-3" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif">{value}</div>
    </div>
  );
}