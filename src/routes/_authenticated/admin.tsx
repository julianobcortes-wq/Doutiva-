import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Users, DollarSign, BarChart3, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Doutiva" }] }),
  component: AdminLayout,
});

type Tab = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean };
const tabs: Tab[] = [
  { to: "/admin", label: "Visão geral", icon: BarChart3, exact: true },
  { to: "/admin/members", label: "Membros", icon: Users },
  { to: "/admin/finance", label: "Financeiro", icon: DollarSign },
  { to: "/admin/commissions", label: "Comissões", icon: Shield },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isRoot = pathname === "/admin";

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-24 md:pb-12">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-gold" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Painel administrativo</span>
      </div>
      <h1 className="mt-3 font-serif text-4xl">Operação Doutiva</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Curadoria de membros, receita recorrente, repasses e saúde do ecossistema.
      </p>

      <nav className="mt-8 flex flex-wrap gap-1 border-b border-border/60">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to as "/admin"}
              className={`flex items-center gap-2 px-4 py-3 text-sm transition ${
                active
                  ? "border-b-2 border-gold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">{isRoot ? <Overview /> : <Outlet />}</div>
    </div>
  );
}

function Overview() {
  const kpis = [
    { label: "Membros ativos", value: "1.847", delta: "+62 (mês)" },
    { label: "MRR", value: "R$ 1,82M", delta: "+8,4%" },
    { label: "Churn", value: "1,2%", delta: "−0,3 p.p." },
    { label: "NPS Doutiva", value: "84", delta: "+3" },
    { label: "Aplicações pendentes", value: "37", delta: "fila curadoria" },
    { label: "Repasses do mês", value: "R$ 218k", delta: "afiliados + mentores" },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {kpis.map((k) => (
        <div key={k.label} className="rounded-sm border border-border/60 bg-card p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{k.label}</div>
          <div className="mt-3 font-serif text-3xl">{k.value}</div>
          <div className="mt-1 text-xs text-gold">{k.delta}</div>
        </div>
      ))}
    </div>
  );
}