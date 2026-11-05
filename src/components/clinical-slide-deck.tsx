import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import type { Slide } from "@/content/lesson-types";

type Props = {
  slides: Slide[];
  /** Controlled index for guided session loop. */
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
      if (e.key === "ArrowRight") go(1);
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
    <div className={full ? "fixed inset-0 z-50 flex flex-col bg-background p-4 md:p-10" : "relative"}>
      <div
        className={`relative flex flex-col overflow-hidden rounded-sm border border-gold/25 bg-card ${full ? "flex-1" : "min-h-[440px] md:aspect-[16/9] md:min-h-0"}`}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-70" />
        {showChrome && (
          <div className="flex items-center justify-between px-5 pt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <span>Doutiva · Lâmina {i + 1}/{n}</span>
            <button onClick={() => setFull((f) => !f)} aria-label="Tela cheia" className="hover:text-foreground">
              {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        )}
        <div key={i} className="flex flex-1 flex-col justify-center px-5 py-6 animate-in fade-in slide-in-from-right-2 duration-300 md:px-12">
          <SlideBody s={s} />
        </div>
        {showChrome && (
          <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
            <button onClick={() => go(-1)} disabled={i === 0} className="rounded-sm p-2 text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Anterior"><ChevronLeft className="h-5 w-5" /></button>
            <div className="flex flex-wrap justify-center gap-1.5">
              {slides.map((_, k) => (
                <button key={k} onClick={() => setI(k)} aria-label={`Lâmina ${k + 1}`} className={`h-1.5 rounded-full transition-all ${k === i ? "w-6 bg-gold" : "w-1.5 bg-muted-foreground/30"}`} />
              ))}
            </div>
            <button onClick={() => go(1)} disabled={i === n - 1} className="rounded-sm p-2 text-muted-foreground hover:text-foreground disabled:opacity-30" aria-label="Próxima"><ChevronRight className="h-5 w-5" /></button>
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
        <div className="text-center">
          {s.eyebrow && <div className="text-[10px] uppercase tracking-[0.35em] text-gold">{s.eyebrow}</div>}
          <h3 className="mt-4 text-3xl font-extralight leading-tight md:text-5xl">{s.title}</h3>
          {s.subtitle && <p className="mx-auto mt-4 max-w-xl font-light text-muted-foreground">{s.subtitle}</p>}
        </div>
      );
    case "bullets":
      return (
        <div>
          <h3 className="text-xl font-light md:text-3xl">{s.title}</h3>
          <ul className="mt-5 space-y-3">
            {s.bullets.map((b) => (
              <li key={b} className="flex gap-3 text-sm font-light leading-relaxed md:text-base"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{b}</li>
            ))}
          </ul>
          {s.note && <p className="mt-5 text-xs text-muted-foreground">{s.note}</p>}
        </div>
      );
    case "bars": {
      const max = Math.max(...s.bars.map((b) => Math.abs(b.value)));
      return (
        <div>
          <h3 className="text-xl font-light md:text-3xl">{s.title}</h3>
          <div className="mt-6 space-y-3">
            {s.bars.map((b) => (
              <div key={b.label} className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 text-xs md:grid-cols-[11rem_1fr_4rem] md:text-sm">
                <span className="font-light text-muted-foreground">{b.label}</span>
                <div className="h-3 rounded-full bg-secondary">
                  <div className={`h-3 rounded-full ${b.highlight ? "bg-gold" : "bg-muted-foreground/50"}`} style={{ width: `${(Math.abs(b.value) / max) * 100}%` }} />
                </div>
                <span className={`text-right tabular-nums ${b.highlight ? "text-gold" : ""}`}>{b.value > 0 ? "" : "−"}{Math.abs(b.value).toLocaleString("pt-BR")}{s.unit}</span>
              </div>
            ))}
          </div>
          {s.note && <p className="mt-4 text-xs font-light text-muted-foreground">{s.note}</p>}
          <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Fonte: {s.source}</p>
        </div>
      );
    }
    case "flow":
      return (
        <div>
          <h3 className="text-xl font-light md:text-3xl">{s.title}</h3>
          <ol className="mt-6 grid gap-3 md:grid-flow-col md:auto-cols-fr">
            {s.steps.map((st, k) => (
              <li key={st.label} className="relative rounded-sm border border-gold/25 bg-gold/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Passo {k + 1}</div>
                <div className="mt-1 text-sm">{st.label}</div>
                {st.detail && <div className="mt-1 text-xs font-light text-muted-foreground">{st.detail}</div>}
              </li>
            ))}
          </ol>
          {s.note && <p className="mt-4 text-xs text-muted-foreground">{s.note}</p>}
        </div>
      );
    case "table":
      return (
        <div>
          <h3 className="text-xl font-light md:text-3xl">{s.title}</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-xs md:text-sm">
              <thead><tr>{s.head.map((h) => <th key={h} className="border-b border-gold/30 py-2 pr-3 font-normal text-[10px] uppercase tracking-[0.2em] text-gold">{h}</th>)}</tr></thead>
              <tbody>
                {s.rows.map((r, k) => (
                  <tr key={k} className="border-b border-border/50">{r.map((c, j) => <td key={j} className={`py-2 pr-3 font-light ${j === 0 ? "text-foreground" : "text-muted-foreground"}`}>{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          {s.source && <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Fonte: {s.source}</p>}
        </div>
      );
    case "split":
      return (
        <div>
          <h3 className="text-xl font-light md:text-3xl">{s.title}</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[s.left, s.right].map((col, k) => (
              <div key={col.label} className={`rounded-sm border p-4 ${k === 0 ? "border-gold/30 bg-gold/5" : "border-destructive/30 bg-destructive/5"}`}>
                <div className={`text-[10px] uppercase tracking-[0.25em] ${k === 0 ? "text-gold" : "text-destructive"}`}>{col.label}</div>
                <ul className="mt-3 space-y-2">{col.items.map((it) => <li key={it} className="text-sm font-light">{it}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      );
    case "pearl":
      return (
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-[10px] uppercase tracking-[0.35em] text-gold">Pérola clínica</div>
          <h3 className="mt-3 text-lg font-light text-muted-foreground">{s.title}</h3>
          <p className="mt-4 text-xl font-extralight leading-relaxed md:text-3xl">“{s.text}”</p>
          {s.source && <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{s.source}</p>}
        </div>
      );
  }
}
