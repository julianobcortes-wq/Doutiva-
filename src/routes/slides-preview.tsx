import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClinicalSlideDeck } from "@/components/clinical-slide-deck";
import { lesson1 } from "@/content/peptides/module-1-2a";

export const Route = createFileRoute("/slides-preview")({
  head: () => ({
    meta: [{ title: "Prévia das lâminas — Doutiva" }],
  }),
  component: SlidesPreviewPage,
});

function SlidesPreviewPage() {
  const slides = lesson1.slides;
  const [index, setIndex] = useState(0);

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Prévia · Peptídeos · Aula 1</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">Lâminas novas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Deck com ilustrações — {slides.length} lâminas · setas ou chips abaixo
        </p>
        <div className="mt-8">
          <ClinicalSlideDeck slides={slides} index={index} onIndexChange={setIndex} showChrome />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`rounded-sm border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition ${
                i === index
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-border/60 text-muted-foreground hover:border-gold/40"
              }`}
            >
              {String(i + 1).padStart(2, "0")} · {s.kind}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
