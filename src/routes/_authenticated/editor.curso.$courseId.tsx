import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StudioGate } from "@/components/studio/studio-gate";
import { studioCreateLesson, studioGetCourse, studioSaveCourse } from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/editor/curso/$courseId")({
  head: () => ({ meta: [{ title: "Editar curso — Estúdio Doutiva" }, { name: "description", content: "Edite curso e ementa." }] }),
  component: () => <StudioGate><CourseEditor /></StudioGate>,
});

const slugify = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
const STATUS: Record<string, string> = { draft: "Rascunho", review: "Em revisão", published: "Publicada" };

type Form = {
  title: string; slug: string; subtitle: string; description: string; category: string; level: string;
  instructor_name: string; instructor_title: string; cover_url: string; duration_minutes: number; published: boolean; featured: boolean;
};
const blank: Form = { title: "", slug: "", subtitle: "", description: "", category: "", level: "Avançado", instructor_name: "", instructor_title: "", cover_url: "", duration_minutes: 0, published: false, featured: false };

function CourseEditor() {
  const { courseId } = Route.useParams();
  const isNew = courseId === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const save = useServerFn(studioSaveCourse);
  const createLesson = useServerFn(studioCreateLesson);
  const { data } = useQuery({ queryKey: ["studio-course", courseId], queryFn: () => studioGetCourse({ data: { id: courseId } }), enabled: !isNew });
  const [f, setF] = useState<Form>(blank);
  const [busy, setBusy] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    const c = data?.course;
    if (c) setF({
      title: c.title, slug: c.slug, subtitle: c.subtitle ?? "", description: c.description ?? "", category: c.category ?? "", level: c.level,
      instructor_name: c.instructor_name ?? "", instructor_title: c.instructor_title ?? "", cover_url: c.cover_url ?? "",
      duration_minutes: c.duration_minutes, published: c.published, featured: c.featured,
    });
  }, [data]);

  const modules = useMemo(() => {
    const m = new Map<string, NonNullable<typeof data>["lessons"]>();
    for (const l of data?.lessons ?? []) { const k = l.module_title ?? "Sem módulo"; m.set(k, [...(m.get(k) ?? []), l]); }
    return [...m.entries()];
  }, [data]);

  const set = (p: Partial<Form>) => setF((x) => ({ ...x, ...p }));
  const nul = (s: string) => (s.trim() ? s.trim() : null);

  async function onSave() {
    setBusy(true);
    try {
      const r = await save({ data: { id: isNew ? null : courseId, ...f, slug: f.slug || slugify(f.title), subtitle: nul(f.subtitle), description: nul(f.description), category: nul(f.category), instructor_name: nul(f.instructor_name), instructor_title: nul(f.instructor_title), cover_url: nul(f.cover_url) } });
      toast.success("Curso salvo");
      qc.invalidateQueries({ queryKey: ["studio-courses"] });
      qc.invalidateQueries({ queryKey: ["courses"] });
      if (isNew) navigate({ to: "/editor/curso/$courseId", params: { courseId: r.id } });
      else qc.invalidateQueries({ queryKey: ["studio-course", courseId] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro ao salvar"); }
    finally { setBusy(false); }
  }

  async function addLesson(moduleTitle: string | null) {
    const r = await createLesson({ data: { courseId, moduleTitle } });
    navigate({ to: "/editor/aula/$lessonId", params: { lessonId: r.id } });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-6">
      <Link to="/editor" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" /> Estúdio</Link>
      <h1 className="mt-4 text-3xl font-extralight">{isNew ? "Novo curso" : f.title || "Curso"}</h1>

      <div className="mt-8 grid gap-4 rounded-sm border border-border/60 bg-card p-5 md:grid-cols-2 md:p-6">
        <div className="md:col-span-2"><Label>Título</Label><Input value={f.title} onChange={(e) => set({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} /></div>
        <div><Label>Endereço (slug)</Label><Input value={f.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) }); }} /></div>
        <div><Label>Categoria</Label><Input placeholder="Biotecnologia, Carreira…" value={f.category} onChange={(e) => set({ category: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>Subtítulo</Label><Input value={f.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></div>
        <div className="md:col-span-2"><Label>Descrição</Label><Textarea value={f.description} onChange={(e) => set({ description: e.target.value })} /></div>
        <div><Label>Professor responsável</Label><Input placeholder="Dr(a). Nome" value={f.instructor_name} onChange={(e) => set({ instructor_name: e.target.value })} /></div>
        <div><Label>Credenciais</Label><Input placeholder="Especialidade · CRM" value={f.instructor_title} onChange={(e) => set({ instructor_title: e.target.value })} /></div>
        <div><Label>Nível</Label><Input value={f.level} onChange={(e) => set({ level: e.target.value })} /></div>
        <div><Label>Duração total (min)</Label><Input type="number" value={f.duration_minutes} onChange={(e) => set({ duration_minutes: Number(e.target.value) || 0 })} /></div>
        <div className="md:col-span-2"><Label>Imagem de capa (link)</Label><Input value={f.cover_url} onChange={(e) => set({ cover_url: e.target.value })} /></div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={f.published} onCheckedChange={(v) => set({ published: v })} /> Visível na Universidade</label>
        <label className="flex items-center gap-3 text-sm"><Switch checked={f.featured} onCheckedChange={(v) => set({ featured: v })} /> Destaque</label>
        <div className="md:col-span-2 flex justify-end">
          <Button disabled={busy || f.title.length < 2} onClick={onSave} className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">{busy ? "Salvando…" : "Salvar curso"}</Button>
        </div>
      </div>

      {!isNew && (
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-light">Ementa</h2>
            <Button variant="outline" className="rounded-sm border-gold/40" onClick={() => addLesson(null)}><Plus className="mr-2 h-4 w-4" /> Nova aula</Button>
          </div>
          <div className="mt-4 space-y-6">
            {modules.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma aula ainda. Crie a primeira e use “Gerar com IA”.</p>}
            {modules.map(([m, ls]) => (
              <div key={m}>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gold">{m}</div>
                  <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => addLesson(m)}>+ aula neste módulo</button>
                </div>
                <div className="mt-2 divide-y divide-border/60 rounded-sm border border-border/60">
                  {ls.map((l) => (
                    <Link key={l.id} to="/editor/aula/$lessonId" params={{ lessonId: l.id }} className="flex items-center gap-3 p-4 hover:bg-secondary/40">
                      <span className="w-6 text-xs text-muted-foreground">{l.position}</span>
                      <span className="flex-1 truncate font-light">{l.title}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] ${l.status === "published" ? "border-gold/40 text-gold" : l.status === "review" ? "border-primary/40 text-primary" : "border-border text-muted-foreground"}`}>{STATUS[l.status] ?? l.status}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
