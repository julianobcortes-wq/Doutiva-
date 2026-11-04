import { Link } from "@tanstack/react-router";
import { Activity, Coins, Flame } from "lucide-react";
import { levelFromXp } from "@/lib/economy";
import { tierFor } from "@/lib/valley-v1";
import { useProgress } from "@/lib/use-progress";

/** Barra de status persistente (HUD de RPG): nível, XP, moedas e constância sempre visíveis. */
export function StatusHud({ expert }: { expert: boolean }) {
  const real = useProgress();
  const ready = real !== null;

  const lvl = levelFromXp(real?.xp ?? 0);
  const pct = Math.min(100, Math.round((lvl.xpInLevel / lvl.xpToNext) * 100));
  const tier = tierFor(lvl.level);
  const accent = expert ? "text-sage" : "text-gold";
  const bar = expert ? "bg-sage" : "bg-gold";
  const n = (v: number) => (ready ? v.toLocaleString("pt-BR") : "—");

  return (
    <div className="sticky top-16 z-20 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="flex items-center gap-4 overflow-x-auto px-6 py-2.5 text-xs">
        {/* Nível + XP */}
        <div className="flex min-w-[190px] shrink-0 items-center gap-3">
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-sm border font-serif text-sm ${
              expert ? "border-sage/40 text-sage" : "border-gold/40 text-gold"
            }`}
          >
            {ready ? lvl.level : "–"}
          </span>
          <span className="flex-1">
            <span className="flex items-center justify-between gap-3">
              <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                {expert ? "Nível de atuação" : "Nível"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {ready ? `${lvl.xpInLevel}/${lvl.xpToNext} XP` : "—"}
              </span>
            </span>
            <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-secondary">
              <span className={`block h-full ${bar}`} style={{ width: `${ready ? pct : 0}%` }} />
            </span>
          </span>
        </div>

        <Divider />

        <HudStat
          to="/marketplace"
          icon={Coins}
          label="Créditos"
          value={`${n(real?.credits ?? 0)}`}
          accent={accent}
        />
        <HudStat
          to="/ranking"
          icon={Activity}
          label="Patamar"
          value={ready ? `${tier.tier}. ${tier.name}` : "—"}
          accent={accent}
        />
        <HudStat
          to="/caso-do-dia"
          icon={Flame}
          label="Sequência"
          value={ready ? `${real?.streak ?? 0} dias` : "—"}
          accent={accent}
        />
      </div>
    </div>
  );
}

function Divider() {
  return <span className="hidden h-8 w-px shrink-0 bg-border/60 sm:block" />;
}

function HudStat({
  to,
  icon: Icon,
  label,
  value,
  accent,
  hideBelow,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
  hideBelow?: "xl";
}) {
  return (
    <Link
      to={to as "/dashboard"}
      className={`group flex shrink-0 items-center gap-2 rounded-sm px-2 py-1 transition hover:bg-secondary/60 ${
        hideBelow === "xl" ? "hidden xl:flex" : ""
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${accent}`} />
      <span>
        <span className="block text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
          {label}
        </span>
        <span className="block font-serif text-sm leading-tight text-foreground">{value}</span>
      </span>
    </Link>
  );
}
