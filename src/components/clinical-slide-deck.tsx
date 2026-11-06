import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import type { Slide } from "@/content/lesson-types";
import { cn } from "@/lib/utils";

type Props = {
  slides: Slide[];
  index?: number;
  onIndexChange?: (i: number) => void;
  showChrome?: boolean;
};

export function ClinicalSlideDeck({ slides, index, onIndexChange, showChrome = true }: Props) {
  const controlled = typeof index === "number";
  const [internal, setInternal] = useState(0);
  const i = controlled ? index! : internal;
  const setI = useCallback(
    (v: number | ((prev: number) => number)) => {
      const next = typeof v === "function" ? v(controlled ? index! : internal) : v;
      const clamped = Math.min(slides.length - 1, Math.max(0, next));
      if (!controlled) setInternal(clamped);
      onIndexChange?.(clamped);
    },
    [controlled, index, internal, onIndexChange, slides.length],
  );
  const [full, setFull] = useState(false);
  const touch = useRef<number | null>(null);
  const n = slides.length;
  const go = useCallback((d: number) => setI((v) => v + d), [setI]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    if (!controlled) setInternal(0);
  }, [slides, controlled]);

  if (!n) return null;
  const s = slides[i];

  return (
    <div className={full ? "fixed inset-0 z-50 flex flex-col bg-background p-3 md:p-8" : "relative"}>
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-sm border border-gold/20 bg-card shadow-[var(--shadow-elegant)]",
          full ? "flex-1" : "min-h-[480px] md:aspect-[16/9] md:min-h-0",
        )}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
      >
        {/* Atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,oklch(0.82_0.13_205/0.14),transparent_50%),radial-gradient(ellipse_at_100%_100%,oklch(0.77_0.15_165/0.08),transparent_45%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.82 0.13 205 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.82 0.13 205 / 0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

        {showChrome && (
          <div className="relative z-10 flex items-center justify-between px-6 pt-5 text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
            <span>
              Doutiva <span className="text-gold/80">·</span> Lâmina{" "}
              <span className="tabular-nums text-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground/50"> / {String(n).padStart(2, "0")}</span>
            </span>
            <button
              type="button"
              onClick={() => setFull((f) => !f)}
              aria-label="Tela cheia"
              className="rounded-sm border border-border/60 p-1.5 transition hover:border-gold/40 hover:text-gold"
            >
              {full ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}

        <div
          key={i}
          className="relative z-10 flex flex-1 flex-col justify-center px-6 py-8 animate-in fade-in slide-in-from-right-3 duration-400 md:px-14 md:py-10"
        >
          <SlideBody s={s} />
        </div>

        {showChrome && (
          <div className="relative z-10 flex items-center justify-between border-t border-border/40 bg-background/40 px-3 py-2.5 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={i === 0}
              className="rounded-sm p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-25"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-wrap justify-center gap-1.5">
              {slides.map((_, k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setI(k)}
                  aria-label={`Lâmina ${k + 1}`}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    k === i ? "w-8 bg-gold" : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/50",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={i === n - 1}
              className="rounded-sm p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-25"
              aria-label="Próxima"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SlideBody({ s }: { s: Slide }) {
  switch (s.kind) {
    case "title":
      return (
        <div className="mx-auto max-w-4xl text-center">
          {s.eyebrow && (
            <div className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.4em] text-gold">
              <span className="h-px w-8 bg-gold/60" />
              {s.eyebrow}
              <span className="h-px w-8 bg-gold/60" />
            </div>
          )}
          <h3 className="mt-8 font-display text-[clamp(2rem,5.5vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.03em]">
            {s.title}
          </h3>
          {s.subtitle && (
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-muted-foreground md:text-lg">
              {s.subtitle}
            </p>
          )}
        </div>
      );

    case "bullets":
      return (
        <div className="mx-auto w-full max-w-3xl">
          <h3 className="font-display text-2xl font-medium tracking-tight md:text-4xl">{s.title}</h3>
          <ul className="mt-8 space-y-0 border-t border-border/50">
            {s.bullets.map((b, idx) => (
              <li
                key={b}
                className="grid grid-cols-[3rem_1fr] gap-4 border-b border-border/40 py-4 md:grid-cols-[4rem_1fr]"
              >
                <span className="font-display text-sm tabular-nums text-gold/80">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-light leading-relaxed text-foreground/90 md:text-base">
                  {b}
                </span>
              </li>
            ))}
          </ul>
          {s.note && <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{s.note}</p>}
        </div>
      );

    case "bars": {
      const max = Math.max(...s.bars.map((b) => Math.abs(b.value)), 1);
      return (
        <div className="mx-auto w-full max-w-3xl">
          <h3 className="font-display text-2xl font-medium tracking-tight md:text-4xl">{s.title}</h3>
          <div className="mt-10 space-y-5">
            {s.bars.map((b) => (
              <div key={b.label} className="grid grid-cols-[7rem_1fr_4.5rem] items-center gap-3 md:grid-cols-[10rem_1fr_5rem] md:gap-5">
                <span className="truncate text-xs font-light text-muted-foreground md:text-sm">
                  {b.label}
                </span>
                <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700",
                      b.highlight
                        ? "bg-gradient-to-r from-gold/70 to-gold"
                        : "bg-muted-foreground/45",
                    )}
                    style={{ width: `${(Math.abs(b.value) / max) * 100}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "text-right font-display text-sm tabular-nums md:text-base",
                    b.highlight ? "text-gold" : "text-foreground/80",
                  )}
                >
                  {b.value > 0 ? "" : "−"}
                  {Math.abs(b.value).toLocaleString("pt-BR")}
                  <span className="text-[10px] text-muted-foreground">{s.unit}</span>
                </span>
              </div>
            ))}
          </div>
          {s.note && <p className="mt-6 text-xs text-muted-foreground">{s.note}</p>}
          <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
            Fonte · {s.source}
          </p>
        </div>
      );
    }

    case "flow":
      return (
        <div className="mx-auto w-full max-w-5xl">
          <h3 className="font-display text-2xl font-medium tracking-tight md:text-4xl">{s.title}</h3>
          <ol className="mt-10 grid gap-3 md:grid-flow-col md:auto-cols-fr md:gap-0">
            {s.steps.map((st, k) => (
              <li key={st.label} className="relative flex flex-col md:px-2">
                {k < s.steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute right-0 top-7 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-gold/50 to-gold/10 md:block"
                  />
                )}
                <div className="relative rounded-sm border border-gold/25 bg-gradient-to-b from-gold/[0.08] to-transparent p-4">
                  <div className="font-display text-2xl tabular-nums text-gold/90">
                    {String(k + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-3 text-sm font-medium leading-snug">{st.label}</div>
                  {st.detail && (
                    <div className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                      {st.detail}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {s.note && <p className="mt-6 text-xs text-muted-foreground">{s.note}</p>}
        </div>
      );

    case "table":
      return (
        <div className="mx-auto w-full max-w-5xl">
          <h3 className="font-display text-2xl font-medium tracking-tight md:text-4xl">{s.title}</h3>
          <div className="mt-8 overflow-x-auto rounded-sm border border-border/50">
            <table className="w-full min-w-[520px] text-left text-xs md:text-sm">
              <thead>
                <tr className="bg-gold/[0.07]">
                  {s.head.map((h) => (
                    <th
                      key={h}
                      className="border-b border-gold/30 px-4 py-3 font-normal text-[10px] uppercase tracking-[0.22em] text-gold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.rows.map((r, k) => (
                  <tr key={k} className="border-b border-border/40 odd:bg-background/30">
                    {r.map((c, j) => (
                      <td
                        key={j}
                        className={cn(
                          "px-4 py-3 font-light leading-snug",
                          j === 0 ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {s.source && (
            <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
              Fonte · {s.source}
            </p>
          )}
        </div>
      );

    case "split":
      return (
        <div className="mx-auto w-full max-w-4xl">
          <h3 className="font-display text-2xl font-medium tracking-tight md:text-4xl">{s.title}</h3>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[s.left, s.right].map((col, k) => (
              <div
                key={col.label}
                className={cn(
                  "rounded-sm border p-6",
                  k === 0
                    ? "border-gold/35 bg-gradient-to-br from-gold/10 to-transparent"
                    : "border-border/60 bg-secondary/40",
                )}
              >
                <div
                  className={cn(
                    "text-[10px] uppercase tracking-[0.28em]",
                    k === 0 ? "text-gold" : "text-muted-foreground",
                  )}
                >
                  {col.label}
                </div>
                <ul className="mt-5 space-y-3">
                  {col.items.map((it) => (
                    <li key={it} className="flex gap-3 text-sm font-light leading-relaxed">
                      <span
                        className={cn(
                          "mt-2 h-1 w-1 shrink-0 rounded-full",
                          k === 0 ? "bg-gold" : "bg-muted-foreground",
                        )}
                      />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );

    case "pearl":
      return (
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-gold">
            <span className="h-px w-10 bg-gold/50" />
            Pérola clínica
            <span className="h-px w-10 bg-gold/50" />
          </div>
          <h3 className="mt-6 text-sm font-light uppercase tracking-[0.2em] text-muted-foreground">
            {s.title}
          </h3>
          <p className="mt-8 font-display text-[clamp(1.35rem,3.5vw,2.35rem)] font-medium leading-snug tracking-[-0.02em] text-foreground">
            “{s.text}”
          </p>
          {s.source && (
            <p className="mt-8 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
              {s.source}
            </p>
          )}
        </div>
      );
  }
}
