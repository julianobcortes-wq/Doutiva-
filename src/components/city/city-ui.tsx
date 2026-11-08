import { Link } from "@tanstack/react-router";
import { Check, Crown, Flame, Lock, Sparkles, Star, TrendingUp, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { stageName, type CityProfile, type CitySpace, type District, type Mission } from "@/lib/city";
import { Button } from "@/components/ui/button";

export function RoleBadge({ label, premium }: { label: string; premium?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
        premium ? "border-gold/50 bg-gold/10 text-gold" : "border-border/70 bg-secondary/50 text-muted-foreground"
      }`}
    >
      {premium ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      {label}
    </span>
  );
}

export function LevelProgress({ profile }: { profile: CityProfile }) {
  const pct = Math.min(100, Math.round((profile.xp / profile.xp_to_next) * 100));
  return (
    <div className="rounded-sm border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Nível {profile.level}</span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold">{stageName(profile)}</span>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-soft" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{profile.xp} XP</span>
        <span>{profile.xp_to_next - profile.xp} XP para o próximo nível</span>
      </div>
    </div>
  );
}

export function ScoreRing({ value, label }: { value: number; label: string }) {
  const dash = `${value * 2.64} 264`;
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="42" className="fill-none stroke-secondary" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="42"
            className="fill-none stroke-gold" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={dash}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-serif text-3xl text-gold">{value}</span>
        </div>
      </div>
      <div>
        <div className="font-serif text-xl">{label}</div>
        <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
          Indicador educacional da sua evolução na cidade.
        </p>
      </div>
    </div>
  );
}

export function PillarBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">{value}</span>
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-gold/70" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function MetricCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-sm border border-border/60 bg-background/60 p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-gold" />
      </div>
      <div className="mt-3 font-serif text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function StreakCard({ streak, points }: { streak: number; points: number }) {
  return (
    <div className="grid gap-4 rounded-sm border border-border/60 bg-card p-5 sm:grid-cols-2">
      <div className="flex items-center gap-3">
        <Flame className="h-5 w-5 text-gold" />
        <div>
          <div className="font-serif text-2xl">{streak} dias</div>
          <div className="text-xs text-muted-foreground">Sequência ativa</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Star className="h-5 w-5 text-gold" />
        <div>
          <div className="font-serif text-2xl">{points}</div>
          <div className="text-xs text-muted-foreground">Pontos Doutiva disponíveis</div>
        </div>
      </div>
    </div>
  );
}

export function MissionRow({ mission, done, onToggle }: { mission: Mission; done: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-4 border-b border-border/60 px-1 py-3 text-left last:border-b-0"
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-sm border transition ${
          done ? "border-gold bg-gold/15 text-gold" : "border-border/70 text-transparent"
        }`}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1">
        <span className={`block text-sm ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
          {mission.title}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{mission.area}</span>
      </span>
      <span className="text-xs uppercase tracking-[0.2em] text-gold">+{mission.xp} XP</span>
    </button>
  );
}

export function DistrictCard({ district }: { district: District }) {
  const Icon = district.icon;
  return (
    <Link
      to={district.to as "/dashboard"}
      className="group flex flex-col gap-3 bg-background p-6 transition hover:bg-card"
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-gold" />
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-gold" />
      </div>
      <div className="font-serif text-xl">{district.name}</div>
      <p className="text-sm text-muted-foreground">{district.desc}</p>
      <div className="mt-auto flex items-center justify-between pt-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <span>{district.highlight}</span>
        <span className="text-gold/80">{district.status}</span>
      </div>
    </Link>
  );
}

export function AchievementBadge({ name, desc, unlocked }: { name: string; desc: string; unlocked: boolean }) {
  return (
    <div className={`rounded-sm border p-5 ${unlocked ? "border-gold/40 bg-gold/5" : "border-border/60 bg-card"}`}>
      <div className="flex items-center justify-between">
        {unlocked ? <Star className="h-4 w-4 text-gold" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
        <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
          {unlocked ? "Conquistado" : "Bloqueado"}
        </span>
      </div>
      <div className={`mt-3 font-serif text-lg ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{name}</div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

export function UpgradeCard({
  title, desc, cta, to = "/billing",
}: { title: string; desc: string; cta: string; to?: string }) {
  return (
    <div className="rounded-sm border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6">
      <Crown className="h-5 w-5 text-gold" />
      <div className="mt-3 font-serif text-xl">{title}</div>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <Button asChild className="mt-5 rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
        <Link to={to as "/billing"}>{cta}</Link>
      </Button>
    </div>
  );
}

export function ReputationCard({ score, views }: { score: number; views: number }) {
  return (
    <div className="rounded-sm border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="font-serif text-xl">Reputação profissional</div>
        <TrendingUp className="h-4 w-4 text-gold" />
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-soft" style={{ width: `${score}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="font-serif text-2xl text-gold">{score}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Índice</div>
        </div>
        <div>
          <div className="font-serif text-2xl">{views.toLocaleString("pt-BR")}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Visitas ao perfil</div>
        </div>
        <div>
          <div className="font-serif text-2xl">4,9</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Avaliação</div>
        </div>
      </div>
    </div>
  );
}

export function SpaceCard({ space }: { space: CitySpace }) {
  const locked = space.status === "Em breve" || space.status === "Exclusivo Pro";
  return (
    <div className="flex flex-col rounded-sm border border-border/60 bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="font-serif text-lg">{space.name}</div>
        {locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Check className="h-4 w-4 text-gold" />}
      </div>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{space.desc}</p>
      <span className="mt-4 text-[10px] uppercase tracking-[0.25em] text-gold/80">{space.status}</span>
    </div>
  );
}

export function Disclaimer({ text }: { text: string }) {
  return (
    <p className="mt-8 rounded-sm border border-dashed border-border/70 bg-card/40 p-4 text-xs text-muted-foreground">
      {text}
    </p>
  );
}
