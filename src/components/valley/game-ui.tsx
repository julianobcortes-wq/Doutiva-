import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  difficultyLabel, inventoryStateLabel, missionKindLabel, rarityClass, rarityLabel,
  sourceLabel, walletTotal, xpForLevel,
  type Difficulty, type InventoryEntry, type JourneyCampaignDef, type JourneyChapterDef,
  type RichMission, type Season, type StoreProduct, type ValleyEvent, type ValleyItem, type Wallet,
} from "@/lib/economy";
import {
  Coins, Sparkles, Lock, Check, ArrowUpRight, Gift, Flame, CalendarRange,
  Package, Layers, Star, Trophy,
} from "lucide-react";

function money(cents?: number) {
  if (cents === undefined) return null;
  if (cents === 0) return "Incluído";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

/* ── Progresso e loops ────────────────────────────────────── */

export function GameLoopSummary({ accent = "gold" }: { accent?: "gold" | "sage" }) {
  const steps = ["Descobrir", "Escolher", "Agir", "Feedback", "Evoluir", "Desbloquear"];
  return (
    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-2">
          <span className={i === 2 ? `text-${accent}` : ""}>{s}</span>
          {i < steps.length - 1 && <span className="text-border">→</span>}
        </span>
      ))}
    </div>
  );
}

export function XpBar({
  xp, level, accent = "gold",
}: { xp: number; level: number; accent?: "gold" | "sage" }) {
  const need = xpForLevel(level);
  const pct = Math.min(100, Math.round((xp % need / need) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Nível {level}</span>
        <span>{pct}% para o nível {level + 1}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-700 ${accent === "sage" ? "bg-sage" : "bg-gold"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function WeeklyProgress({
  items, accent = "gold",
}: { items: { label: string; value: number; goal: number }[]; accent?: "gold" | "sage" }) {
  return (
    <div className="rounded-sm border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl">Resumo da semana</h3>
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-5 space-y-4">
        {items.map((i) => {
          const pct = Math.min(100, Math.round((i.value / i.goal) * 100));
          return (
            <div key={i.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{i.label}</span>
                <span className={accent === "sage" ? "text-sage" : "text-gold"}>{i.value}/{i.goal}</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
                <div className={`h-full ${accent === "sage" ? "bg-sage" : "bg-gold"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StreakRecovery({
  current, best, activeDays, accent = "gold",
}: { current: number; best: number; activeDays: number; accent?: "gold" | "sage" }) {
  return (
    <div className="rounded-sm border border-border/60 bg-card p-6">
      <div className="flex items-center gap-2">
        <Flame className={`h-4 w-4 ${accent === "sage" ? "text-sage" : "text-gold"}`} />
        <h3 className="font-serif text-xl">Consistência</h3>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Atual", value: `${current}d` },
          { label: "Melhor", value: `${best}d` },
          { label: "Ativos no mês", value: `${activeDays}d` },
        ].map((s) => (
          <div key={s.label} className="rounded-sm border border-border/60 p-3">
            <div className="font-serif text-2xl">{s.value}</div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Pausar não apaga sua evolução. Quando voltar, retomamos de onde você parou.
      </p>
    </div>
  );
}

/* ── Feedback ─────────────────────────────────────────────── */

export function RewardReveal({
  open, title, detail, rewards, accent = "gold", onClose,
}: {
  open: boolean; title: string; detail: string; rewards: string[];
  accent?: "gold" | "sage"; onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 w-[min(28rem,90vw)] -translate-x-1/2 md:bottom-8">
      <div
        className={`pointer-events-auto animate-in fade-in slide-in-from-bottom-4 rounded-sm border bg-card/95 p-5 shadow-lg backdrop-blur ${
          accent === "sage" ? "border-sage/50" : "border-gold/50"
        }`}
      >
        <div className="flex items-start gap-3">
          <Sparkles className={`mt-0.5 h-4 w-4 ${accent === "sage" ? "text-sage" : "text-gold"}`} />
          <div className="flex-1">
            <div className="font-serif text-lg">{title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {rewards.map((r) => (
                <span
                  key={r}
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                    accent === "sage" ? "border-sage/40 text-sage" : "border-gold/40 text-gold"
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">fechar</button>
        </div>
      </div>
    </div>
  );
}

export function LevelUpModal({
  open, level, className: cls, onClose,
}: { open: boolean; level: number; className: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-6 backdrop-blur">
      <div className="w-full max-w-md rounded-sm border border-gold/50 bg-card p-8 text-center">
        <Trophy className="mx-auto h-6 w-6 text-gold" />
        <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Nova etapa</div>
        <h2 className="mt-2 font-serif text-3xl">{cls} — Nível {level}</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Sua trajetória avançou. Novos desbloqueios ficaram disponíveis no seu espaço.
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-sm border border-gold/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gold hover:bg-gold/10"
        >
          Ver o que mudou
        </button>
      </div>
    </div>
  );
}

/* ── Carteira e economia ──────────────────────────────────── */

export function LifePointsBalance({ wallet, accent = "gold" }: { wallet: Wallet; accent?: "gold" | "sage" }) {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-border/60 bg-card px-4 py-2">
      <Coins className={`h-4 w-4 ${accent === "sage" ? "text-sage" : "text-gold"}`} />
      <span className="font-serif text-lg">{walletTotal(wallet).toLocaleString("pt-BR")}</span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Pontos Doutiva</span>
    </div>
  );
}

export function ValleyWallet({ wallet, accent = "gold" }: { wallet: Wallet; accent?: "gold" | "sage" }) {
  const rows = [
    { label: "Conquistados", value: wallet.earned_life_points, hint: "Obtidos por ações reais. Sem validade." },
    { label: "Adquiridos", value: wallet.purchased_life_points, hint: "Comprados com preço claro. Reembolso em 7 dias." },
    { label: "Promocionais", value: wallet.promotional_life_points, hint: "Concedidos em campanhas. Podem expirar." },
  ];
  return (
    <div className="rounded-sm border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl">Carteira da Doutiva</h3>
        <span className={`font-serif text-2xl ${accent === "sage" ? "text-sage" : "text-gold"}`}>
          {walletTotal(wallet).toLocaleString("pt-BR")}
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label} className="rounded-sm border border-border/60 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{r.label}</div>
            <div className="mt-1 font-serif text-2xl">{r.value.toLocaleString("pt-BR")}</div>
            <p className="mt-2 text-xs text-muted-foreground">{r.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RewardHistory({
  transactions,
}: { transactions: { id: string; label: string; detail: string; amount: number; source: keyof typeof sourceLabel; created_at: string; expires_at?: string }[] }) {
  return (
    <div className="rounded-sm border border-border/60 bg-card">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between gap-4 border-b border-border/50 p-4 last:border-0">
          <div>
            <div className="text-sm">{t.label}</div>
            <div className="text-xs text-muted-foreground">
              {sourceLabel[t.source]} · {t.detail || "—"} · {t.created_at}
              {t.expires_at ? ` · expira ${t.expires_at}` : ""}
            </div>
          </div>
          <span className={`font-serif text-lg ${t.amount >= 0 ? "text-gold" : "text-muted-foreground"}`}>
            {t.amount >= 0 ? "+" : ""}{t.amount}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Loja e itens ─────────────────────────────────────────── */

export function RarityTag({ rarity }: { rarity: ValleyItem["rarity"] }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] ${rarityClass[rarity]}`}>
      {rarityLabel[rarity]}
    </span>
  );
}

export function StoreItemCard({
  product, onAcquire, accent = "gold",
}: { product: StoreProduct; onAcquire?: (p: StoreProduct) => void; accent?: "gold" | "sage" }) {
  return (
    <div className="flex flex-col rounded-sm border border-border/60 bg-card p-6 transition hover:border-gold/40">
      <div className="flex items-start justify-between gap-3">
        <RarityTag rarity={product.rarity} />
        {product.requirement && (
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <Lock className="h-3 w-3" /> {product.requirement}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-serif text-xl">{product.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{product.desc}</p>
      {product.benefit && <p className="mt-3 text-xs text-muted-foreground">Benefício: {product.benefit}</p>}
      {product.seller && <p className="mt-1 text-xs text-muted-foreground">Responsável: {product.seller}</p>}
      <div className="mt-auto pt-6">
        <div className="flex flex-wrap items-baseline gap-3">
          {product.price_money_cents !== undefined && (
            <span className="font-serif text-2xl">{money(product.price_money_cents)}</span>
          )}
          {product.price_life_points !== undefined && (
            <span className={`text-sm ${accent === "sage" ? "text-sage" : "text-gold"}`}>
              ou {product.price_life_points.toLocaleString("pt-BR")} LP
            </span>
          )}
        </div>
        <button
          onClick={() => onAcquire?.(product)}
          className={`mt-4 w-full rounded-sm border px-4 py-2 text-xs uppercase tracking-[0.2em] ${
            accent === "sage" ? "border-sage/40 text-sage hover:bg-sage/10" : "border-gold/40 text-gold hover:bg-gold/10"
          }`}
        >
          Ver detalhes e condições
        </button>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Preço, duração, renovação e cancelamento são exibidos antes da confirmação.
        </p>
      </div>
    </div>
  );
}

export function InventoryItemCard({
  entry, item,
}: { entry: InventoryEntry; item: ValleyItem }) {
  return (
    <div className="flex flex-col rounded-sm border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <RarityTag rarity={item.rarity} />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {inventoryStateLabel[entry.state]}
        </span>
      </div>
      <h3 className="mt-4 font-serif text-lg">{item.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
      <div className="mt-auto pt-4 text-xs text-muted-foreground">
        Obtido {entry.acquired_at} · {entry.acquisition_source}
        {entry.expires_at ? ` · expira ${entry.expires_at}` : ""}
      </div>
    </div>
  );
}

export function EquippedItems({
  slots, equipped, onEquip, accent = "gold",
}: {
  slots: { id: string; label: string; hint: string; options: string[] }[];
  equipped: Record<string, string>;
  onEquip: (slot: string, value: string) => void;
  accent?: "gold" | "sage";
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {slots.map((s) => (
        <div key={s.id} className="rounded-sm border border-border/60 bg-card p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
          <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {s.options.map((o) => {
              const active = (equipped[s.id] ?? s.options[0]) === o;
              return (
                <button
                  key={o}
                  onClick={() => onEquip(s.id, o)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    active
                      ? accent === "sage"
                        ? "border-sage bg-sage/10 text-sage"
                        : "border-gold bg-gold/10 text-gold"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Missões ──────────────────────────────────────────────── */

export function DifficultyTag({ level }: { level: Difficulty }) {
  return (
    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{difficultyLabel[level]}</span>
  );
}

export function DailyMissionPanel({
  missions, done, onComplete, accent = "gold",
}: {
  missions: RichMission[];
  done: string[];
  onComplete: (m: RichMission) => void;
  accent?: "gold" | "sage";
}) {
  return (
    <div className="grid gap-4">
      {missions.map((m) => {
        const isDone = done.includes(m.id);
        return (
          <article
            key={m.id}
            className={`rounded-sm border bg-card p-6 transition ${
              isDone ? (accent === "sage" ? "border-sage/50" : "border-gold/50") : "border-border/60"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full border px-3 py-0.5 text-[9px] uppercase tracking-[0.2em] ${
                accent === "sage" ? "border-sage/40 text-sage" : "border-gold/40 text-gold"
              }`}>
                {missionKindLabel[m.kind]}
              </span>
              <DifficultyTag level={m.difficulty} />
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{m.duration}</span>
            </div>
            <h3 className="mt-3 font-serif text-2xl">{m.title}</h3>
            <p className="mt-2 text-sm italic text-muted-foreground">{m.narrative}</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              <p><span className="text-foreground">Por que importa: </span>{m.why}</p>
              <p><span className="text-foreground">Requisito: </span>{m.requirement}</p>
              {m.journey && <p><span className="text-foreground">Jornada: </span>{m.journey}</p>}
              <p><span className="text-foreground">Próximo passo: </span>{m.next_step}</p>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em]">
                <span className={accent === "sage" ? "text-sage" : "text-gold"}>+{m.xp} XP</span>
                <span className="text-muted-foreground">+{m.life_points} LP</span>
                <span className="text-muted-foreground">move {m.attribute}</span>
              </div>
              <button
                onClick={() => onComplete(m)}
                className={`flex items-center gap-2 rounded-sm border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  isDone
                    ? "border-border/60 text-muted-foreground"
                    : accent === "sage"
                      ? "border-sage/40 text-sage hover:bg-sage/10"
                      : "border-gold/40 text-gold hover:bg-gold/10"
                }`}
              >
                {isDone ? <><Check className="h-3 w-3" /> Concluída</> : "Concluir missão"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ── Temporada e eventos ──────────────────────────────────── */

export function SeasonProgress({
  season, xp, accent = "gold",
}: { season: Season; xp: number; accent?: "gold" | "sage" }) {
  const pct = Math.min(100, Math.round((xp / season.goal) * 100));
  return (
    <div className="rounded-sm border border-border/60 bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className={`text-[10px] uppercase tracking-[0.3em] ${accent === "sage" ? "text-sage" : "text-gold"}`}>
            Temporada · {season.starts} a {season.ends}
          </span>
          <h3 className="mt-2 font-serif text-2xl">{season.name}</h3>
        </div>
        <span className="font-serif text-2xl">{xp}/{season.goal}</span>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{season.narrative}</p>
      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full ${accent === "sage" ? "bg-sage" : "bg-gold"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SeasonPass({
  season, xp, claimed, accent = "gold",
}: { season: Season; xp: number; claimed: number[]; accent?: "gold" | "sage" }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-sm border border-border/60 bg-border/60 md:grid-cols-5">
      {season.rewards.map((r) => {
        const reached = xp >= r.at;
        const got = claimed.includes(r.at);
        return (
          <div key={r.at} className="bg-background p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{r.at} XP</span>
              {got ? <Check className={`h-4 w-4 ${accent === "sage" ? "text-sage" : "text-gold"}`} />
                : reached ? <Gift className={`h-4 w-4 ${accent === "sage" ? "text-sage" : "text-gold"}`} />
                : <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
            <p className={`mt-4 text-sm ${reached ? "" : "text-muted-foreground"}`}>{r.label}</p>
          </div>
        );
      })}
    </div>
  );
}

export function EventBanner({ event, accent = "gold" }: { event: ValleyEvent; accent?: "gold" | "sage" }) {
  return (
    <div
      className={`rounded-sm border p-6 ${
        accent === "sage" ? "border-sage/40 bg-gradient-to-br from-sage/10 to-transparent" : "border-gold/40 bg-gradient-to-br from-gold/10 to-transparent"
      }`}
    >
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{event.window}</span>
      <h3 className="mt-2 font-serif text-2xl">{event.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{event.desc}</p>
      <p className="mt-3 text-xs text-muted-foreground">{event.effect}</p>
    </div>
  );
}

/* ── Jornadas ─────────────────────────────────────────────── */

export function JourneyChapter({
  chapter, index, done, onToggle, accent = "gold",
}: {
  chapter: JourneyChapterDef; index: number; done: boolean;
  onToggle: () => void; accent?: "gold" | "sage";
}) {
  return (
    <div className={`rounded-sm border p-5 ${done ? (accent === "sage" ? "border-sage/50" : "border-gold/50") : "border-border/60"}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Capítulo {index + 1}</span>
        <button
          onClick={onToggle}
          className={`text-[10px] uppercase tracking-[0.2em] ${accent === "sage" ? "text-sage" : "text-gold"}`}
        >
          {done ? "Concluído" : "Marcar capítulo"}
        </button>
      </div>
      <h4 className="mt-2 font-serif text-xl">{chapter.title}</h4>
      <p className="mt-2 text-sm text-muted-foreground">{chapter.focus}</p>
      <p className="mt-3 text-sm italic text-muted-foreground">{chapter.reflection}</p>
      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Recompensa · {chapter.reward}</p>
    </div>
  );
}

export function JourneyCampaign({
  journey, doneChapters, onToggleChapter, accent = "gold",
}: {
  journey: JourneyCampaignDef;
  doneChapters: string[];
  onToggleChapter: (id: string) => void;
  accent?: "gold" | "sage";
}) {
  const [open, setOpen] = useState(false);
  const total = journey.chapters.length;
  const done = journey.chapters.filter((c) => doneChapters.includes(`${journey.id}:${c.id}`)).length;
  return (
    <article className="rounded-sm border border-border/60 bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <DifficultyTag level={journey.difficulty} />
          <h3 className="mt-2 font-serif text-2xl">{journey.name}</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{journey.narrative}</p>
          <p className="mt-2 text-sm text-muted-foreground"><span className="text-foreground">Objetivo: </span>{journey.objective}</p>
        </div>
        <div className="text-right">
          <div className={`font-serif text-2xl ${accent === "sage" ? "text-sage" : "text-gold"}`}>{done}/{total}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">capítulos</div>
        </div>
      </div>

      <div className="mt-4">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Caminhos possíveis — você decide</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {journey.paths.map((p) => (
            <span key={p} className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">{p}</span>
          ))}
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className={`mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] ${accent === "sage" ? "text-sage" : "text-gold"}`}
      >
        {open ? "Recolher campanha" : "Abrir capítulos"} <ArrowUpRight className="h-3 w-3" />
      </button>

      {open && (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {journey.chapters.map((c, i) => (
            <JourneyChapter
              key={c.id}
              chapter={c}
              index={i}
              done={doneChapters.includes(`${journey.id}:${c.id}`)}
              onToggle={() => onToggleChapter(`${journey.id}:${c.id}`)}
              accent={accent}
            />
          ))}
        </div>
      )}
    </article>
  );
}

/* ── Espaço pessoal e coleções ────────────────────────────── */

export function SpaceProgress({
  level, sections, accent = "gold",
}: {
  level: number;
  sections: { id: string; name: string; desc: string; unlockLevel: number }[];
  accent?: "gold" | "sage";
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sections.map((s) => {
        const unlocked = level >= s.unlockLevel;
        return (
          <div
            key={s.id}
            className={`rounded-sm border p-6 ${unlocked ? (accent === "sage" ? "border-sage/40 bg-card" : "border-gold/40 bg-card") : "border-dashed border-border/60 bg-card/40"}`}
          >
            <div className="flex items-center justify-between">
              <Layers className={`h-4 w-4 ${unlocked ? (accent === "sage" ? "text-sage" : "text-gold") : "text-muted-foreground"}`} />
              {!unlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
            <h3 className="mt-4 font-serif text-xl">{s.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {unlocked ? "Disponível" : `Abre no nível ${s.unlockLevel}`}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function UserSpace({
  title, subtitle, children,
}: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <section className="rounded-sm border border-border/60 bg-card p-8">
      <h2 className="font-serif text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
      {children}
    </section>
  );
}

export function CollectionGallery({
  items,
}: { items: { id: string; name: string; rarity: ValleyItem["rarity"]; note: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <div key={i.id} className="rounded-sm border border-border/60 bg-card p-5">
          <Star className="h-4 w-4 text-gold" />
          <h4 className="mt-3 font-serif text-lg">{i.name}</h4>
          <p className="mt-1 text-xs text-muted-foreground">{i.note}</p>
          <div className="mt-3"><RarityTag rarity={i.rarity} /></div>
        </div>
      ))}
    </div>
  );
}

export function StoreLink({ to, name, tagline, desc }: { to: string; name: string; tagline: string; desc: string }) {
  return (
    <Link
      to={to as "/store"}
      className="group flex items-start justify-between gap-4 rounded-sm border border-border/60 bg-card p-6 transition hover:border-gold/40"
    >
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold">{tagline}</span>
        <h3 className="mt-2 font-serif text-xl">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      <Package className="h-4 w-4 text-muted-foreground transition group-hover:text-gold" />
    </Link>
  );
}
