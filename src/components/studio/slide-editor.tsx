import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Slide } from "@/content/lesson-types";

const KINDS: { v: Slide["kind"]; l: string; help: string }[] = [
  { v: "title", l: "Capa", help: "Subtítulo opcional. Campo imagem: URL (/slides/...)." },
  { v: "figure", l: "Figura full-bleed", help: "Linha 1 = legenda. Campo imagem obrigatório." },
  { v: "media", l: "Texto + imagem", help: "Linha 1 = corpo. Demais linhas = bullets. Campo imagem obrigatório." },
  { v: "bullets", l: "Tópicos", help: "Um tópico por linha. Imagem opcional ao lado." },
  { v: "bars", l: "Gráfico de barras", help: "Uma barra por linha: rótulo | valor | * (asterisco destaca)." },
  { v: "table", l: "Tabela", help: "Primeira linha = cabeçalho. Colunas separadas por |." },
  { v: "flow", l: "Fluxo / algoritmo", help: "Um passo por linha: rótulo | detalhe." },
  { v: "split", l: "Comparação", help: "Itens da esquerda, linha com ---, itens da direita." },
  { v: "pearl", l: "Pérola clínica", help: "Frase central no campo de texto." },
];

const split = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const cells = (l: string) => l.split("|").map((c) => c.trim());

/** Slide → editable plain text body */
function toBody(s: Slide): string {
  switch (s.kind) {
    case "bullets":
      return s.bullets.join("\n");
    case "bars":
      return s.bars.map((b) => `${b.label} | ${b.value}${b.highlight ? " | *" : ""}`).join("\n");
    case "table":
      return [s.head.join(" | "), ...s.rows.map((r) => r.join(" | "))].join("\n");
    case "flow":
      return s.steps.map((st) => (st.detail ? `${st.label} | ${st.detail}` : st.label)).join("\n");
    case "split":
      return [...s.left.items, "---", ...s.right.items].join("\n");
    case "pearl":
      return s.text;
    case "figure":
      return s.caption ?? "";
    case "media":
      return [s.body, ...(s.bullets ?? [])].filter(Boolean).join("\n");
    default:
      return s.subtitle ?? "";
  }
}

function fromBody(kind: Slide["kind"], base: Slide, body: string): Slide {
  const title = base.title;
  const extra = base as Record<string, any>;
  const lines = split(body);
  switch (kind) {
    case "title":
      return { kind, title, eyebrow: extra.eyebrow, subtitle: body, image: extra.image, imageAlt: extra.imageAlt };
    case "figure":
      return {
        kind,
        title,
        caption: body,
        image: extra.image || "/slides/peptide-molecule.jpg",
        imageAlt: extra.imageAlt,
        credit: extra.credit,
      };
    case "media":
      return {
        kind,
        title,
        eyebrow: extra.eyebrow,
        body: lines[0] ?? "",
        bullets: lines.slice(1),
        image: extra.image || "/slides/peptide-molecule.jpg",
        imageAlt: extra.imageAlt,
        imageSide: extra.imageSide === "left" ? "left" : "right",
        credit: extra.credit,
      };
    case "bullets":
      return { kind, title, bullets: lines, note: extra.note, image: extra.image, imageAlt: extra.imageAlt };
    case "bars":
      return {
        kind,
        title,
        unit: extra.unit ?? "",
        source: extra.source ?? "",
        note: extra.note,
        bars: lines.map((l) => {
          const [label, v, h] = cells(l);
          return {
            label: label ?? "",
            value: Number((v ?? "0").replace(",", ".")) || 0,
            highlight: h === "*",
          };
        }),
      };
    case "table": {
      const [h = "", ...rows] = lines;
      return { kind, title, head: cells(h), rows: rows.map(cells), source: extra.source };
    }
    case "flow":
      return {
        kind,
        title,
        note: extra.note,
        steps: lines.map((l) => {
          const [label, detail] = cells(l);
          return { label: label ?? "", detail };
        }),
      };
    case "split": {
      const i = lines.indexOf("---");
      const left = i < 0 ? lines : lines.slice(0, i),
        right = i < 0 ? [] : lines.slice(i + 1);
      return {
        kind,
        title,
        left: { label: extra.left?.label ?? "Sim", items: left },
        right: { label: extra.right?.label ?? "Não", items: right },
      };
    }
    case "pearl":
      return { kind, title, text: body, source: extra.source };
  }
}

export function SlideEditor({ slides, onChange }: { slides: Slide[]; onChange: (s: Slide[]) => void }) {
  const set = (i: number, s: Slide) => onChange(slides.map((x, k) => (k === i ? s : x)));
  const move = (i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= slides.length) return;
    const n = [...slides]; [n[i], n[j]] = [n[j], n[i]]; onChange(n);
  };

  return (
    <div className="space-y-4">
      {slides.map((s, i) => {
        const meta = KINDS.find((k) => k.v === s.kind)!;
        const x = s as Record<string, any>;
        return (
          <div key={i} className="rounded-sm border border-border/60 bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold">Lâmina {i + 1}</span>
              <select value={s.kind} onChange={(e) => set(i, fromBody(e.target.value as Slide["kind"], s, toBody(s)))} className="h-8 rounded-sm border border-border bg-background px-2 text-xs">
                {KINDS.map((k) => <option key={k.v} value={k.v}>{k.l}</option>)}
              </select>
              <div className="ml-auto flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(i, -1)} aria-label="Subir"><ArrowUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(i, 1)} aria-label="Descer"><ArrowDown className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onChange(slides.filter((_, k) => k !== i))} aria-label="Remover"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <Input className="mt-3" placeholder="Título da lâmina" value={s.title} onChange={(e) => set(i, { ...s, title: e.target.value } as Slide)} />
            <Textarea className="mt-2 min-h-[110px] font-mono text-xs" value={toBody(s)} onChange={(e) => set(i, fromBody(s.kind, s, e.target.value))} />
            <p className="mt-1 text-[11px] text-muted-foreground">{meta.help}</p>
            {(s.kind === "title" ||
              s.kind === "figure" ||
              s.kind === "media" ||
              s.kind === "bullets") && (
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <Input
                  placeholder="URL da imagem (ex.: /slides/peptide-molecule.jpg)"
                  value={x.image ?? ""}
                  onChange={(e) => set(i, { ...s, image: e.target.value || undefined } as Slide)}
                />
                <Input
                  placeholder="Alt / crédito visual"
                  value={x.imageAlt ?? x.credit ?? ""}
                  onChange={(e) =>
                    set(
                      i,
                      s.kind === "figure" || s.kind === "media"
                        ? ({ ...s, credit: e.target.value || undefined } as Slide)
                        : ({ ...s, imageAlt: e.target.value || undefined } as Slide),
                    )
                  }
                />
              </div>
            )}
            {(s.kind === "bars" || s.kind === "table" || s.kind === "pearl") && (
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {s.kind === "bars" && <Input placeholder="Unidade (ex.: %)" value={x.unit ?? ""} onChange={(e) => set(i, { ...s, unit: e.target.value } as Slide)} />}
                <Input placeholder="Fonte (estudo, revista, ano)" value={x.source ?? ""} onChange={(e) => set(i, { ...s, source: e.target.value } as Slide)} />
              </div>
            )}
            {s.kind === "split" && (
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <Input placeholder="Rótulo esquerda" value={s.left.label} onChange={(e) => set(i, { ...s, left: { ...s.left, label: e.target.value } })} />
                <Input placeholder="Rótulo direita" value={s.right.label} onChange={(e) => set(i, { ...s, right: { ...s.right, label: e.target.value } })} />
              </div>
            )}
          </div>
        );
      })}
      <Button variant="outline" className="w-full rounded-sm border-dashed" onClick={() => onChange([...slides, { kind: "bullets", title: "", bullets: [] }])}>
        <Plus className="mr-2 h-4 w-4" /> Adicionar lâmina
      </Button>
    </div>
  );
}
