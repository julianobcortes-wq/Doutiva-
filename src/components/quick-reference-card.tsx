import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonMarkdown } from "@/components/lesson-markdown";

export function QuickReferenceCard({ title, md }: { title: string; md: string }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-xs font-light text-muted-foreground">Ficha de consultório. Use “Imprimir” e escolha “Salvar como PDF”.</p>
        <Button size="sm" variant="outline" onClick={() => window.print()} className="rounded-sm border-gold/40"><Printer className="mr-2 h-4 w-4" /> Imprimir / PDF</Button>
      </div>
      <div id="quick-ref-print" className="rounded-sm border border-gold/30 bg-card p-5 md:p-8">
        <div className="flex items-baseline justify-between border-b border-gold/30 pb-3">
          <span className="text-sm tracking-[0.3em]">DOUTIVA</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold">Guia de bolso</span>
        </div>
        <h3 className="mt-4 text-xl font-light">{title}</h3>
        <div className="mt-4"><LessonMarkdown>{md}</LessonMarkdown></div>
        <p className="mt-6 border-t border-border/60 pt-3 text-[10px] text-muted-foreground">Material educacional. Confirme doses em bula e diretrizes vigentes. Decisão clínica é individual.</p>
      </div>
    </div>
  );
}
