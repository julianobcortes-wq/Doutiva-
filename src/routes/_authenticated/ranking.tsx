import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Flame, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProgress } from "@/lib/use-progress";

export const Route = createFileRoute("/_authenticated/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking — Doutiva" },
      { name: "description", content: "Ranking de XP dos médicos da Doutiva, alimentado por Caso do Dia e aulas concluídas." },
      { property: "og:title", content: "Ranking — Doutiva" },
      { property: "og:description", content: "Quem mais evoluiu estudando na Doutiva." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RankingPage,
});

type Row = { rank: number; name: string; xp: number; streak: number; is_me: boolean };

function RankingPage() {
  const progress = useProgress();
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    supabase.rpc("get_leaderboard").then(({ data }) => setRows((data as Row[]) ?? []));
  }, []);
  const me = rows?.find((r) => r.is_me);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-24 md:pb-12">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Ranking</span>
      <h1 className="mt-3 text-4xl font-light">Quem mais evoluiu</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">XP real, somado pelo Caso do Dia e pelas aulas concluídas.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Stat icon={Trophy} label="Sua posição" value={me ? `${me.rank}º` : "—"} />
        <Stat icon={TrendingUp} label="Seu XP" value={String(progress?.xp ?? 0)} />
        <Stat icon={Flame} label="Sequência" value={`${progress?.streak ?? 0} dias`} />
      </div>

      <div className="mt-10 overflow-hidden rounded-sm border border-border/60 bg-card">
        {rows === null && <p className="p-6 text-sm text-muted-foreground">Carregando…</p>}
        {rows?.length === 0 && <p className="p-6 text-sm text-muted-foreground">Ninguém pontuou ainda. Resolva o Caso do Dia e seja o primeiro.</p>}
        {rows?.map((l) => (
          <div key={l.rank} className={`grid grid-cols-12 items-center border-b border-border/40 px-6 py-4 text-sm last:border-b-0 ${l.is_me ? "bg-secondary/60" : ""}`}>
            <div className="col-span-1 text-xl font-light">{l.rank}</div>
            <div className="col-span-7">{l.name}{l.is_me && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}</div>
            <div className="col-span-2 text-right text-muted-foreground">{l.streak} dias</div>
            <div className="col-span-2 text-right font-mono">{l.xp.toLocaleString("pt-BR")} XP</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border/60 bg-card p-5">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="mt-4 text-3xl font-light">{value}</div>
    </div>
  );
}
