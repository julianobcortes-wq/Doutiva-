import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ExternalLink,
  FileUp,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudioGate } from "@/components/studio/studio-gate";
import {
  libraryDelete,
  libraryImport,
  libraryList,
  librarySaveManual,
  librarySearch,
  type SourceHit,
} from "@/lib/library.functions";

export const Route = createFileRoute("/_authenticated/editor/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca Científica — Doutiva" },
      {
        name: "description",
        content: "Estudos, ensaios clínicos e diretrizes que fundamentam as aulas da Doutiva.",
      },
      { property: "og:title", content: "Biblioteca Científica — Doutiva" },
      {
        property: "og:description",
        content: "A base de evidências da escola do médico do futuro.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <StudioGate>
      <Library />
    </StudioGate>
  ),
});

const TYPE_LABEL: Record<string, string> = {
  pubmed: "PubMed",
  trial: "Ensaio registrado",
  guideline: "Diretriz",
  pdf: "PDF",
  label: "Bula/registro",
  manual: "Manual",
};
const tabCls =
  "rounded-sm py-2 text-[10px] uppercase tracking-[0.12em] data-[state=active]:bg-card data-[state=active]:text-gold";

function Library() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["library"],
    queryFn: () => libraryList(),
  });
  return (
    <div className="mx-auto max-w-5xl px-5 pb-32 pt-10 md:px-6">
      <Link
        to="/editor"
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Estúdio
      </Link>
      <span className="mt-6 block text-[10px] uppercase tracking-[0.3em] text-gold">
        Base de evidências
      </span>
      <h1 className="mt-2 text-4xl font-extralight">Biblioteca Científica</h1>
      <p className="mt-2 max-w-2xl text-sm font-light text-muted-foreground">
        Toda aula gerada pode ser ancorada nestas fontes. A IA cita cada afirmação com [S#] e só
        referencia o que está aqui. {items.length} fonte(s) no acervo.
      </p>
      <Tabs defaultValue="search" className="mt-8">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-sm bg-secondary/60 p-1">
          <TabsTrigger value="search" className={tabCls}>
            Buscar estudos
          </TabsTrigger>
          <TabsTrigger value="add" className={tabCls}>
            PDF / Diretriz
          </TabsTrigger>
          <TabsTrigger value="list" className={tabCls}>
            Acervo ({items.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="search" className="mt-6">
          <SearchPanel />
        </TabsContent>
        <TabsContent value="add" className="mt-6">
          <ManualPanel />
        </TabsContent>
        <TabsContent value="list" className="mt-6">
          <ListPanel items={items} loading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SearchPanel() {
  const search = useServerFn(librarySearch);
  const imp = useServerFn(libraryImport);
  const qc = useQueryClient();
  const [q, setQ] = useState(() => {
    try {
      return sessionStorage.getItem("doutiva:library-q") ?? "";
    } catch {
      return "";
    }
  });
  const [base, setBase] = useState<"pubmed" | "trials">("pubmed");
  const [high, setHigh] = useState(true);
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [hits, setHits] = useState<(SourceHit & { inLibrary: boolean })[]>([]);
  const [adding, setAdding] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    try {
      const r = await search({ data: { query: q, base, highEvidence: high } });
      if (r.error) toast.error(r.error);
      setHits(r.hits);
      if (!r.error && r.hits.length === 0)
        toast.message("Nenhum resultado. Tente termos em inglês.");
    } finally {
      setBusy(false);
    }
  }
  async function add(h: SourceHit) {
    setAdding(h.external_id);
    try {
      const r = await imp({
        data: {
          ...h,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      });
      const base = r.fullText
        ? "Adicionado com texto completo (acesso aberto)."
        : "Adicionado com resumo.";
      toast.success(
        r.embedded > 0 ? `${base} Embedding pronto para o Tutor.` : `${base} Embedding pendente — rode o seed ou reimporte.`,
      );
      setHits((hs) =>
        hs.map((x) => (x.external_id === h.external_id ? { ...x, inLibrary: true } : x)),
      );
      qc.invalidateQueries({ queryKey: ["library"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-sm border border-border/60 p-5">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["pubmed", "PubMed / PMC"],
              ["trials", "ClinicalTrials.gov"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setBase(v)}
              className={`rounded-sm border px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] ${base === v ? "border-gold text-gold" : "border-border text-muted-foreground"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim().length >= 2) run();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Ex.: tirzepatide obesity, semaglutide cardiovascular outcomes"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button
            type="submit"
            disabled={busy}
            className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>
        <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
          {base === "pubmed" && (
            <label className="flex items-center gap-2">
              <Switch checked={high} onCheckedChange={setHigh} /> Só alta evidência (ECR,
              metanálise, diretriz)
            </label>
          )}
          <div className="flex min-w-[220px] flex-1 items-center gap-2">
            <span>Tags:</span>
            <Input
              className="h-8 text-xs"
              placeholder="peptídeos, obesidade"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Ordenado por número de citações (PubMed) ou por tamanho do ensaio (ClinicalTrials). Termos
          em inglês trazem mais resultados.
        </p>
      </div>
      <div className="space-y-3">
        {hits.map((h) => (
          <div key={h.external_id} className="rounded-sm border border-border/60 p-4">
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="rounded-sm border border-gold/40 px-1.5 py-0.5 text-gold">
                Evidência {h.evidence_level}
              </span>
              <span>{h.study_design}</span>
              {h.open_access && h.source_type === "pubmed" && (
                <span className="text-gold">Texto completo aberto</span>
              )}
              {h.citations != null && <span>{h.citations} citações</span>}
            </div>
            <a
              href={h.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block text-base font-light hover:text-gold"
            >
              {h.title} <ExternalLink className="inline h-3 w-3" />
            </a>
            <div className="mt-1 text-xs text-muted-foreground">
              {[h.authors?.slice(0, 120), h.journal, h.year].filter(Boolean).join(" · ")}
            </div>
            {h.abstract && (
              <p className="mt-2 line-clamp-3 text-xs font-light text-muted-foreground">
                {h.abstract}
              </p>
            )}
            <div className="mt-3">
              {h.inLibrary ? (
                <span className="inline-flex items-center gap-1 text-xs text-gold">
                  <Check className="h-3.5 w-3.5" /> No acervo
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={adding === h.external_id}
                  onClick={() => add(h)}
                >
                  {adding === h.external_id ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-3.5 w-3.5" />
                  )}{" "}
                  Adicionar à biblioteca
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const emptyManual = {
  source_type: "pdf" as "guideline" | "pdf" | "manual" | "label",
  title: "",
  authors: "",
  journal: "",
  year: "",
  doi: "",
  url: "",
  study_design: "",
  evidence_level: "",
  abstract: "",
  full_text: "",
  tags: "",
  notes: "",
};

function ManualPanel() {
  const save = useServerFn(librarySaveManual);
  const qc = useQueryClient();
  const [f, setF] = useState(emptyManual);
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const up = (k: keyof typeof emptyManual, v: string) => setF((x) => ({ ...x, [k]: v }));

  async function onFile(file: File) {
    setProgress(0);
    try {
      const { extractPdfText } = await import("@/lib/pdf-text");
      const { text, pages } = await extractPdfText(file, setProgress);
      if (text.length < 200)
        toast.warning("Pouco texto extraído — o PDF pode ser digitalizado (imagem).");
      setF((x) => ({ ...x, full_text: text, title: x.title || file.name.replace(/\.pdf$/i, "") }));
      toast.success(`${pages} páginas lidas.`);
    } catch (e) {
      console.error(e);
      toast.error("Não consegui ler este PDF.");
    } finally {
      setProgress(null);
    }
  }
  async function submit() {
    setBusy(true);
    try {
      await save({
        data: {
          source_type: f.source_type,
          title: f.title,
          authors: f.authors || null,
          journal: f.journal || null,
          year: f.year ? Number(f.year) : null,
          doi: f.doi || null,
          url: f.url || null,
          study_design: f.study_design || null,
          evidence_level: f.evidence_level || null,
          abstract: f.abstract || null,
          full_text: f.full_text || null,
          tags: f.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          notes: f.notes || null,
        },
      });
      toast.success("Fonte salva na biblioteca.");
      setF(emptyManual);
      qc.invalidateQueries({ queryKey: ["library"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-sm border border-border/60 p-5">
      <p className="text-sm font-light text-muted-foreground">
        Para diretrizes de sociedades, artigos de revistas fechadas (use apenas os que você tem
        direito de acessar), bulas ANVISA/FDA/EMA e consensos.
      </p>
      <div className="flex flex-wrap gap-2">
        {(["pdf", "guideline", "label", "manual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => up("source_type", t)}
            className={`rounded-sm border px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] ${f.source_type === t ? "border-gold text-gold" : "border-border text-muted-foreground"}`}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-gold/40 p-6 text-sm text-muted-foreground hover:bg-gold/5">
        {progress != null ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Lendo PDF… {Math.round(progress * 100)}%
          </>
        ) : (
          <>
            <FileUp className="h-4 w-4" /> Enviar PDF (o texto é extraído automaticamente)
          </>
        )}
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Título</Label>
          <Input value={f.title} onChange={(e) => up("title", e.target.value)} />
        </div>
        <div>
          <Label>Autores / Sociedade</Label>
          <Input value={f.authors} onChange={(e) => up("authors", e.target.value)} />
        </div>
        <div>
          <Label>Revista / Órgão</Label>
          <Input value={f.journal} onChange={(e) => up("journal", e.target.value)} />
        </div>
        <div>
          <Label>Ano</Label>
          <Input
            inputMode="numeric"
            value={f.year}
            onChange={(e) => up("year", e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        </div>
        <div>
          <Label>DOI</Label>
          <Input value={f.doi} onChange={(e) => up("doi", e.target.value)} />
        </div>
        <div>
          <Label>Link</Label>
          <Input value={f.url} onChange={(e) => up("url", e.target.value)} />
        </div>
        <div>
          <Label>Desenho do estudo</Label>
          <Input
            placeholder="ECR fase 3, metanálise, diretriz…"
            value={f.study_design}
            onChange={(e) => up("study_design", e.target.value)}
          />
        </div>
        <div>
          <Label>Nível de evidência (A–D)</Label>
          <Input
            value={f.evidence_level}
            onChange={(e) => up("evidence_level", e.target.value.toUpperCase().slice(0, 2))}
          />
        </div>
        <div>
          <Label>Tags</Label>
          <Input
            placeholder="peptídeos, obesidade"
            value={f.tags}
            onChange={(e) => up("tags", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Resumo</Label>
          <Textarea value={f.abstract} onChange={(e) => up("abstract", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>
            Texto completo ({f.full_text ? f.full_text.split(/\s+/).length : 0} palavras)
          </Label>
          <Textarea
            className="min-h-[160px] text-xs"
            value={f.full_text}
            onChange={(e) => up("full_text", e.target.value)}
          />
        </div>
      </div>
      <Button
        disabled={busy || f.title.trim().length < 2}
        onClick={submit}
        className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft"
      >
        {busy ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <BookOpen className="mr-2 h-4 w-4" />
        )}{" "}
        Salvar na biblioteca
      </Button>
    </div>
  );
}

type Item = Awaited<ReturnType<typeof libraryList>>[number];

function ListPanel({ items, loading }: { items: Item[]; loading: boolean }) {
  const del = useServerFn(libraryDelete);
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const shown = useMemo(() => {
    const t = filter.toLowerCase();
    return t
      ? items.filter((i) =>
          `${i.title} ${i.authors ?? ""} ${i.tags.join(" ")} ${i.journal ?? ""}`
            .toLowerCase()
            .includes(t),
        )
      : items;
  }, [items, filter]);
  return (
    <div className="space-y-4">
      <Input
        placeholder="Filtrar por título, autor, tag…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {loading && <p className="text-sm text-muted-foreground">Carregando…</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Acervo vazio. Comece buscando os estudos pivotais do seu tema.
        </p>
      )}
      <div className="divide-y divide-border/60 rounded-sm border border-border/60">
        {shown.map((i) => (
          <div key={i.id} className="flex gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>{TYPE_LABEL[i.source_type] ?? i.source_type}</span>
                {i.evidence_level && (
                  <span className="text-gold">Evidência {i.evidence_level}</span>
                )}
                <span>
                  {i.hasFullText
                    ? `Texto completo · ${i.words.toLocaleString("pt-BR")} palavras`
                    : "Só resumo"}
                </span>
                {i.tags.map((t) => (
                  <span key={t} className="rounded-sm bg-secondary px-1.5">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-1 text-sm font-light">
                {i.url ? (
                  <a href={i.url} target="_blank" rel="noreferrer" className="hover:text-gold">
                    {i.title}
                  </a>
                ) : (
                  i.title
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {[i.authors?.slice(0, 100), i.journal, i.year].filter(Boolean).join(" · ")}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Remover"
              onClick={async () => {
                if (!confirm("Remover esta fonte?")) return;
                await del({ data: { id: i.id } });
                qc.invalidateQueries({ queryKey: ["library"] });
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
