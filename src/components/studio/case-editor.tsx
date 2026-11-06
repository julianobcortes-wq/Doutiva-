import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ClinicalCase } from "@/content/lesson-types";

export const emptyCase = (): ClinicalCase => ({
  title: "", vignette: "", question: "Qual a conduta mais adequada?", teaching: "", reward: 40,
  data: [{ label: "", value: "" }],
  options: [0, 1, 2, 3].map((i) => ({ label: "", correct: i === 0, rationale: "" })),
});

export function CaseEditor({ c, onChange }: { c: ClinicalCase; onChange: (c: ClinicalCase) => void }) {
  const set = (p: Partial<ClinicalCase>) => onChange({ ...c, ...p });
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[1fr_140px]">
        <div><Label>Título do caso</Label><Input value={c.title} onChange={(e) => set({ title: e.target.value })} /></div>
        <div><Label>XP</Label><Input type="number" value={c.reward} onChange={(e) => set({ reward: Number(e.target.value) || 0 })} /></div>
      </div>
      <div><Label>História clínica</Label><Textarea className="min-h-[120px]" value={c.vignette} onChange={(e) => set({ vignette: e.target.value })} /></div>

      <div>
        <Label>Dados objetivos (exames, sinais)</Label>
        <div className="mt-2 space-y-2">
          {c.data.map((d, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder="Ex.: HbA1c" value={d.label} onChange={(e) => set({ data: c.data.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} />
              <Input placeholder="Ex.: 8,4%" value={d.value} onChange={(e) => set({ data: c.data.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)) })} />
              <Button size="icon" variant="ghost" onClick={() => set({ data: c.data.filter((_, k) => k !== i) })} aria-label="Remover"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button size="sm" variant="ghost" onClick={() => set({ data: [...c.data, { label: "", value: "" }] })}><Plus className="mr-1 h-3 w-3" /> Dado</Button>
        </div>
      </div>

      <div><Label>Pergunta</Label><Input value={c.question} onChange={(e) => set({ question: e.target.value })} /></div>

      <div className="space-y-3">
        <Label>Alternativas (marque a correta)</Label>
        {c.options.map((o, i) => (
          <div key={i} className={`rounded-sm border p-3 ${o.correct ? "border-gold/50 bg-gold/5" : "border-border/60"}`}>
            <div className="flex items-center gap-2">
              <input type="radio" name="correct" checked={o.correct} onChange={() => set({ options: c.options.map((x, k) => ({ ...x, correct: k === i })) })} aria-label="Correta" />
              <span className="text-xs text-gold">{String.fromCharCode(65 + i)}</span>
              <Input placeholder="Conduta" value={o.label} onChange={(e) => set({ options: c.options.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} />
              <Button size="icon" variant="ghost" onClick={() => set({ options: c.options.filter((_, k) => k !== i) })} aria-label="Remover"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <Textarea className="mt-2 min-h-[60px] text-sm" placeholder="Justificativa baseada em evidência" value={o.rationale} onChange={(e) => set({ options: c.options.map((x, k) => (k === i ? { ...x, rationale: e.target.value } : x)) })} />
          </div>
        ))}
        {c.options.length < 6 && <Button size="sm" variant="ghost" onClick={() => set({ options: [...c.options, { label: "", correct: false, rationale: "" }] })}><Plus className="mr-1 h-3 w-3" /> Alternativa</Button>}
      </div>

      <div><Label>Ensinamento final (aceita markdown)</Label><Textarea className="min-h-[120px] font-mono text-xs" value={c.teaching} onChange={(e) => set({ teaching: e.target.value })} /></div>
    </div>
  );
}
