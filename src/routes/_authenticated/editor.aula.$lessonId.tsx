import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, Loader2, Pencil, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudioGate } from "@/components/studio/studio-gate";
import { SlideEditor } from "@/components/studio/slide-editor";
import { CaseEditor, emptyCase } from "@/components/studio/case-editor";
import { ClinicalSlideDeck } from "@/components/clinical-slide-deck";
import { ClinicalCaseSimulator } from "@/components/clinical-case-simulator";
import { LessonMarkdown } from "@/components/lesson-markdown";
import { libraryList } from "@/lib/library.functions";
import { studioDeleteLesson, studioGenerateLesson, studioGetLesson, studioSaveLesson, studioLessonVersions, studioRestoreVersion } from "@/lib/studio.functions";
import { checkCitations } from "@/lib/citations";
import type { ClinicalCase, Slide } from "@/content/lesson-types";

export const Route = createFileRoute("/_authenticated/editor/aula/$lessonId")({
  head: () => ({ meta: [{ title: "Editar aula — Estúdio Doutiva" }, { name: "description", content: "Editor de aula com slides, monografia, caso clínico e guia." }] }),
  component: () => <StudioGate><LessonEditor /></StudioGate>,
});

type Status = "draft" | "review" | "published";
type F = {
  title: string; description: string; module_title: string; module_position: number; position: number; duration_minutes: number;
  evidence_level: string; video_url: string; keyPoints: string; refs: string;
  slides: Slide[]; monograph: string; quick_ref: string; clinical_case: ClinicalCase; status: Status; reviewed_by: string;
};

const refsToText = (r: { citation: string; url?: string }[]) => r.map((x) => (x.url ? `${x.citation} | ${x.url}` : x.citation)).join("\n");
const textToRefs = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const i = l.lastIndexOf(" | "); return i > 0 && /^https?:/.test(l.slice(i + 3)) ? { citation: l.slice(0, i), url: l.slice(i + 3) } : { citation: l }; });

function LessonEditor() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const save = useServerFn(studioSaveLesson);
  const del = useServerFn(studioDeleteLesson);
  const gen = useServerFn(studioGenerateLesson);
  const { data } = useQuery({ queryKey: ["studio-lesson", lessonId], queryFn: () => studioGetLesson({ data: { id: lessonId } }) });
  const [f, setF] = useState<F | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [ai, setAi] = useState({ topic: "", notes: "", sources: "", loading: false, audit: "" });
  const [sourceIds, setSourceIds] = useState<string[]>([]);

  useEffect(() => {
    if (!data) return;
    const l = data.lesson, r = data.rich;
    setF({
      title: l.title, description: l.description ?? "", module_title: l.module_title ?? "", module_position: l.module_position, position: l.position,
      duration_minutes: l.duration_minutes, evidence_level: l.evidence_level ?? "", video_url: l.video_url ?? "",
      keyPoints: (l.key_points ?? []).join("\n"), refs: refsToText((l.refs as { citation: string; url?: string }[]) ?? []),
      slides: r?.slides ?? [], monograph: r?.monograph ?? "", quick_ref: r?.quickRef ?? "",
      clinical_case: r?.clinicalCase?.vignette ? r.clinicalCase : emptyCase(),
      status: (l.status as Status) ?? "draft", reviewed_by: l.reviewed_by ?? "",
    });
    setAi((a) => ({ ...a, topic: a.topic || (l.title === "Nova aula" ? "" : l.title) }));
  }, [data]);

  if (!data || !f) return <div className="px-6 py-24 text-center text-sm text-muted-foreground">Carregando aula…</div>;
  const set = (p: Partial<F>) => setF((x) => (x ? { ...x, ...p } : x));
  const caseFilled = f.clinical_case.vignette.trim() && f.clinical_case.options.filter((o) => o.label.trim()).length >= 2;

  async function onSave(status?: Status) {
    if (!f) return;
    const st = status ?? f.status;
    setBusy(true);
    try {
      await save({ data: {
        id: lessonId, title: f.title, description: f.description || null, module_title: f.module_title || null,
        module_position: f.module_position, position: f.position, duration_minutes: f.duration_minutes,
        evidence_level: f.evidence_level || null, video_url: f.video_url || null,
        key_points: f.keyPoints.split("\n").map((s) => s.trim()).filter(Boolean),
        refs: textToRefs(f.refs),
        slides: f.slides as unknown as Record<string, unknown>[],
        monograph: f.monograph, quick_ref: f.quick_ref,
        clinical_case: caseFilled ? (f.clinical_case as unknown as Record<string, unknown>) : null,
        status: st, reviewed_by: f.reviewed_by || null,
      } });
      set({ status: st });
      toast.success(st === "published" ? "Aula publicada" : st === "review" ? "Enviada para revisão" : "Rascunho salvo");
      qc.invalidateQueries({ queryKey: ["studio-course", data!.course.id] });
      qc.invalidateQueries({ queryKey: ["course", data!.course.slug] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro ao salvar"); }
    finally { setBusy(false); }
  }

  async function onGenerate() {
    setAi((a) => ({ ...a, loading: true }));
    try {
      const r = await gen({ data: { topic: ai.topic, notes: ai.notes, sources: ai.sources, courseTitle: data!.course.title, moduleTitle: f!.module_title, sourceIds } });
      if (!r.lesson) { toast.error(r.error ?? "Falha ao gerar"); return; }
      const g = r.lesson;
      set({
        title: g.title, description: g.description, evidence_level: g.evidence_level, duration_minutes: g.duration_minutes,
        keyPoints: g.key_points.join("\n"), refs: refsToText(g.refs), slides: g.slides, monograph: g.monograph, quick_ref: g.quickRef,
        clinical_case: g.clinicalCase.vignette ? g.clinicalCase : emptyCase(), status: "draft",
      });
      setAi((a) => ({ ...a, audit: g.audit }));
      toast.success("Rascunho gerado. Leia a auditoria, revise cada aba e salve.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Falha ao gerar"); }
    finally { setAi((a) => ({ ...a, loading: false })); }
  }

  const tabCls = "rounded-sm py-2 text-[10px] uppercase tracking-[0.12em] data-[state=active]:bg-card data-[state=active]:text-gold";

  return (
    <div className="mx-auto max-w-5xl px-5 pb-32 pt-10 md:px-6">
      <Link to="/editor/curso/$courseId" params={{ courseId: data.course.id }} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" /> {data.course.title}</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-balance text-2xl font-extralight md:text-3xl">{f.title}</h1>
        <Button size="sm" variant="ghost" onClick={() => setPreview((p) => !p)}>{preview ? <><Pencil className="mr-2 h-4 w-4" /> Editar</> : <><Eye className="mr-2 h-4 w-4" /> Pré-visualizar</>}</Button>
      </div>

      <Tabs defaultValue="ai" className="mt-6">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-sm bg-secondary/60 p-1 md:grid-cols-7">
          {[["ai", "Gerar com IA"], ["info", "Dados"], ["slides", "Slides"], ["mono", "Monografia"], ["case", "Caso"], ["guide", "Guia"], ["hist", "Histórico"]].map(([v, l]) => <TabsTrigger key={v} value={v} className={tabCls}>{l}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="ai" className="mt-6">
          <div className="space-y-4 rounded-sm border border-gold/30 bg-gold/5 p-5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold"><Sparkles className="h-3.5 w-3.5" /> Coautor IA</div>
            <p className="text-sm font-light text-muted-foreground">Descreva o tema e, se tiver, cole trechos de diretrizes, artigos ou bulas. A IA escreve slides, monografia, caso clínico, guia e referências. Ela substitui o conteúdo atual do editor, mas nada é salvo até você clicar em salvar.</p>
            <div><Label>Tema da aula</Label><Input placeholder="Ex.: Testosterona no hipogonadismo masculino: diagnóstico e reposição" value={ai.topic} onChange={(e) => setAi({ ...ai, topic: e.target.value })} /></div>
            <div><Label>Orientações do mentor (opcional)</Label><Textarea placeholder="Público, profundidade, pontos obrigatórios, o que evitar…" value={ai.notes} onChange={(e) => setAi({ ...ai, notes: e.target.value })} /></div>
            <SourcePicker selected={sourceIds} onChange={setSourceIds} />
            <div><Label>Material-fonte adicional (opcional)</Label><Textarea className="min-h-[140px] text-xs" placeholder="Cole aqui o texto de diretrizes, resumos de artigos, bula…" value={ai.sources} onChange={(e) => setAi({ ...ai, sources: e.target.value })} /></div>
            <Button disabled={ai.loading || ai.topic.trim().length < 3} onClick={onGenerate} className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
              {ai.loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Claude escreve → GPT estrutura → Claude audita… (3–6 min)</> : <><Sparkles className="mr-2 h-4 w-4" /> Gerar aula completa</>}
            </Button>
            {ai.audit && (
              <div className="mt-4 rounded-sm border border-border bg-card/60 p-4">
                <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Auditoria independente da IA revisora</p>
                <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground/90">{ai.audit}</pre>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Label>Título</Label><Input value={f.title} onChange={(e) => set({ title: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Descrição curta</Label><Textarea value={f.description} onChange={(e) => set({ description: e.target.value })} /></div>
            <div><Label>Módulo</Label><Input value={f.module_title} onChange={(e) => set({ module_title: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Ordem mód.</Label><Input type="number" value={f.module_position} onChange={(e) => set({ module_position: Number(e.target.value) || 1 })} /></div>
              <div><Label>Ordem aula</Label><Input type="number" value={f.position} onChange={(e) => set({ position: Number(e.target.value) || 0 })} /></div>
              <div><Label>Minutos</Label><Input type="number" value={f.duration_minutes} onChange={(e) => set({ duration_minutes: Number(e.target.value) || 0 })} /></div>
            </div>
            <div><Label>Nível de evidência</Label><Input placeholder="Nível A — ECRs fase 3" value={f.evidence_level} onChange={(e) => set({ evidence_level: e.target.value })} /></div>
            <div><Label>Vídeo do mentor (YouTube, Vimeo ou .mp4)</Label><Input value={f.video_url} onChange={(e) => set({ video_url: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Pontos-chave (um por linha)</Label><Textarea className="min-h-[110px]" value={f.keyPoints} onChange={(e) => set({ keyPoints: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Referências (uma por linha; link opcional após “ | ”)</Label><Textarea className="min-h-[140px] text-xs" value={f.refs} onChange={(e) => set({ refs: e.target.value })} /></div>
          </div>
        </TabsContent>

        <TabsContent value="slides" className="mt-6">
          {preview ? (f.slides.length ? <ClinicalSlideDeck slides={f.slides} /> : <p className="text-sm text-muted-foreground">Sem slides.</p>) : <SlideEditor slides={f.slides} onChange={(slides) => set({ slides })} />}
        </TabsContent>
        <TabsContent value="mono" className="mt-6">
          {preview ? <LessonMarkdown>{f.monograph || "_Sem monografia._"}</LessonMarkdown> : <Textarea className="min-h-[60vh] font-mono text-xs leading-relaxed" placeholder="## 1. Introdução…" value={f.monograph} onChange={(e) => set({ monograph: e.target.value })} />}
          {!preview && <p className="mt-2 text-[11px] text-muted-foreground">{f.monograph.split(/\s+/).filter(Boolean).length} palavras · aceita títulos (##), tabelas, listas, negrito.</p>}
        </TabsContent>
        <TabsContent value="case" className="mt-6">
          {preview ? (caseFilled ? <ClinicalCaseSimulator c={f.clinical_case} allowClientReveal /> : <p className="text-sm text-muted-foreground">Caso incompleto.</p>) : <CaseEditor c={f.clinical_case} onChange={(clinical_case) => set({ clinical_case })} />}
        </TabsContent>
        <TabsContent value="guide" className="mt-6">
          {preview ? <LessonMarkdown>{f.quick_ref || "_Sem guia._"}</LessonMarkdown> : <Textarea className="min-h-[50vh] font-mono text-xs" value={f.quick_ref} onChange={(e) => set({ quick_ref: e.target.value })} />}
        </TabsContent>
        <TabsContent value="hist" className="mt-6"><VersionHistory lessonId={lessonId} /></TabsContent>
      </Tabs>

      <CitationCheck text={`${f.monograph}\n${f.quick_ref}`} refCount={textToRefs(f.refs).length} />

      <div className="mt-10 rounded-sm border border-border/60 p-5">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Revisão médica</div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div><Label>Médico revisor responsável (obrigatório para publicar)</Label><Input placeholder="Dr(a). Nome · Especialidade · CRM" value={f.reviewed_by} onChange={(e) => set({ reviewed_by: e.target.value })} /></div>
          <span className="text-xs text-muted-foreground">Status atual: <span className="text-gold">{f.status === "published" ? "Publicada" : f.status === "review" ? "Em revisão" : "Rascunho"}</span></span>
        </div>
        <Button variant="ghost" size="sm" className="mt-4 text-destructive" onClick={async () => {
          if (!confirm("Excluir esta aula definitivamente?")) return;
          await del({ data: { id: lessonId } });
          toast.success("Aula excluída");
          navigate({ to: "/editor/curso/$courseId", params: { courseId: data.course.id } });
        }}><Trash2 className="mr-2 h-4 w-4" /> Excluir aula</Button>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border/60 bg-background/95 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-end gap-2 px-5 py-3">
          <Button variant="ghost" disabled={busy} onClick={() => onSave("draft")} className="rounded-sm">Salvar rascunho</Button>
          <Button variant="outline" disabled={busy} onClick={() => onSave("review")} className="rounded-sm border-gold/40">Enviar p/ revisão</Button>
          <Button disabled={busy || !f.reviewed_by.trim()} onClick={() => onSave("published")} className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">Aprovar e publicar</Button>
        </div>
      </div>
    </div>
  );
}

function SourcePicker({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const { data: items = [] } = useQuery({ queryKey: ["library"], queryFn: () => libraryList() });
  const [q, setQ] = useState("");
  const t = q.toLowerCase();
  const shown = (t ? items.filter((i) => `${i.title} ${i.tags.join(" ")} ${i.authors ?? ""}`.toLowerCase().includes(t)) : items).slice(0, 60);
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div>
      <div className="flex items-center justify-between"><Label>Fontes da Biblioteca Científica ({selected.length} selecionada(s))</Label><Link to="/editor/biblioteca" className="text-[10px] uppercase tracking-[0.2em] text-gold">Abrir biblioteca</Link></div>
      {items.length === 0 ? <p className="mt-1 text-xs text-muted-foreground">Biblioteca vazia. Adicione os estudos pivotais antes de gerar — a aula fica ancorada neles.</p> : <>
        <Input className="mt-1 h-8 text-xs" placeholder="Filtrar fontes…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-sm border border-border/60 p-2">
          {shown.map((i) => (
            <label key={i.id} className="flex cursor-pointer items-start gap-2 rounded-sm p-1.5 text-xs hover:bg-secondary/40">
              <input type="checkbox" className="mt-0.5" checked={selected.includes(i.id)} onChange={() => toggle(i.id)} />
              <span><span className="text-gold">{i.evidence_level ?? "—"}</span> · {i.title} <span className="text-muted-foreground">({i.year ?? "s/d"}{i.hasFullText ? ", texto completo" : ""})</span></span>
            </label>
          ))}
        </div>
      </>}
    </div>
  );
}

function CitationCheck({ text, refCount }: { text: string; refCount: number }) {
  const r = checkCitations(text, refCount);
  const ok = r.broken.length === 0 && r.uncited.length === 0;
  return (
    <div className={`mt-8 rounded-sm border p-4 text-xs ${r.broken.length ? "border-destructive/60" : "border-border/60"}`}>
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Conferência de referências</div>
      <p className="mt-2 font-light">
        {r.cited} referência(s) citada(s) de {refCount} listada(s).
        {ok && " Todas as citações apontam para uma referência existente."}
      </p>
      {r.broken.length > 0 && <p className="mt-1 text-destructive">Citações sem referência correspondente: {r.broken.map((n) => `[${n}]`).join(", ")}</p>}
      {r.uncited.length > 0 && <p className="mt-1 text-muted-foreground">Referências nunca citadas no texto: {r.uncited.join(", ")}</p>}
    </div>
  );
}

function VersionHistory({ lessonId }: { lessonId: string }) {
  const qc = useQueryClient();
  const restore = useServerFn(studioRestoreVersion);
  const { data = [], isLoading } = useQuery({ queryKey: ["lesson-versions", lessonId], queryFn: () => studioLessonVersions({ data: { id: lessonId } }) });
  const label: Record<string, string> = { draft: "Rascunho", review: "Em revisão", published: "Publicada" };
  async function onRestore(id: string, v: number) {
    if (!confirm(`Restaurar a versão ${v}? A aula volta para rascunho e precisará de nova revisão.`)) return;
    try {
      await restore({ data: { versionId: id } });
      toast.success(`Versão ${v} restaurada como rascunho.`);
      qc.invalidateQueries({ queryKey: ["studio-lesson", lessonId] });
      qc.invalidateQueries({ queryKey: ["lesson-versions", lessonId] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Falha ao restaurar"); }
  }
  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!data.length) return <p className="text-sm text-muted-foreground">Nenhuma alteração registrada ainda. Cada salvamento guarda a versão anterior aqui.</p>;
  return (
    <div className="divide-y divide-border/60 rounded-sm border border-border/60">
      {data.map((v) => (
        <div key={v.id} className="flex items-center gap-4 p-3 text-sm">
          <span className="w-12 font-mono text-xs text-muted-foreground">v{v.version}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-light">{v.title}</div>
            <div className="text-xs text-muted-foreground">{new Date(v.changed_at).toLocaleString("pt-BR")} · {label[v.status ?? ""] ?? v.status} · {v.mine ? "alterada por você" : "outro mentor"}</div>
          </div>
          <Button size="sm" variant="outline" onClick={() => onRestore(v.id, v.version)}>Restaurar</Button>
        </div>
      ))}
    </div>
  );
}
