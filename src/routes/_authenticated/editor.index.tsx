import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudioGate } from "@/components/studio/studio-gate";
import { studioListCourses, studioReviewQueue, studioMentorCredentials, studioVerifyMentor } from "@/lib/studio.functions";
import { useQueryClient } from "@tanstack/react-query";
import { evidenceAlerts } from "@/lib/library.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_authenticated/editor/")({
  head: () => ({ meta: [{ title: "Estúdio de Cursos — Doutiva" }, { name: "description", content: "Crie e revise cursos e aulas da Doutiva." }] }),
  component: () => <StudioGate><CourseList /></StudioGate>,
});

function CourseList() {
  const { data, isLoading } = useQuery({ queryKey: ["studio-courses"], queryFn: () => studioListCourses() });
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Corpo docente</span>
          <h1 className="mt-2 text-4xl font-extralight">Estúdio de Cursos</h1>
          <p className="mt-2 max-w-xl text-sm font-light text-muted-foreground">Crie cursos, escreva ou gere aulas com IA, revise e publique. Nada chega aos alunos sem um médico revisor.</p>
        </div>
        <div className="flex gap-2">
        <Button asChild variant="outline" className="rounded-sm"><Link to="/editor/biblioteca">Biblioteca Científica</Link></Button>
        <Button asChild className="rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
          <Link to="/editor/curso/$courseId" params={{ courseId: "novo" }}><Plus className="mr-2 h-4 w-4" /> Novo curso</Link>
        </Button>
        </div>
      </div>

      <ReviewQueue />
      <MentorQueue />
      <EvidenceAlerts />

      <div className="mt-10 divide-y divide-border/60 rounded-sm border border-border/60">
        {isLoading && <div className="p-6 text-sm text-muted-foreground">Carregando…</div>}
        {data?.length === 0 && <div className="p-6 text-sm text-muted-foreground">Nenhum curso ainda.</div>}
        {data?.map((c) => (
          <Link key={c.id} to="/editor/curso/$courseId" params={{ courseId: c.id }} className="flex items-center gap-4 p-5 transition hover:bg-secondary/40">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{c.category ?? "Sem categoria"}</div>
              <div className="mt-1 truncate text-lg font-light">{c.title}</div>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>{c.lessons} aulas</span>
                {c.drafts > 0 && <span>{c.drafts} rascunho(s)</span>}
                {c.inReview > 0 && <span className="text-gold">{c.inReview} em revisão</span>}
                <span className={c.published ? "text-gold" : ""}>{c.published ? "Publicado" : "Oculto"}</span>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function ReviewQueue() {
  const { data = [] } = useQuery({ queryKey: ["review-queue"], queryFn: () => studioReviewQueue() });
  if (!data.length) return null;
  const now = Date.now();
  return (
    <section className="mt-10">
      <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Conselho editorial · fila de revisão ({data.length})</h2>
      <div className="mt-3 divide-y divide-border/60 rounded-sm border border-border/60">
        {data.map((l) => {
          const late = l.due && new Date(l.due).getTime() < now;
          return (
            <Link key={l.id} to="/editor/aula/$lessonId" params={{ lessonId: l.id }} className="flex items-center gap-4 p-4 text-sm hover:bg-secondary/40">
              <div className="min-w-0 flex-1"><div className="truncate font-light">{l.title}</div><div className="text-xs text-muted-foreground">{l.course}</div></div>
              <span className={`text-xs ${late ? "text-destructive" : "text-muted-foreground"}`}>
                {l.due ? `${late ? "Atrasada · prazo " : "Prazo "}${new Date(l.due).toLocaleDateString("pt-BR")}` : "Sem prazo"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function MentorQueue() {
  const qc = useQueryClient();
  const verify = useServerFn(studioVerifyMentor);
  const { data = [] } = useQuery({ queryKey: ["mentor-creds"], queryFn: () => studioMentorCredentials() });
  if (!data.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Médicos Mentores · CRM/RQE</h2>
      <div className="mt-3 divide-y divide-border/60 rounded-sm border border-border/60">
        {data.map((m) => (
          <div key={m.user_id} className="flex items-center gap-4 p-4 text-sm">
            <div className="min-w-0 flex-1">
              <div className="font-light">{m.full_name}</div>
              <div className="text-xs text-muted-foreground">CRM {m.crm}/{m.crm_uf}{m.rqe ? ` · RQE ${m.rqe}` : ""}{m.specialty ? ` · ${m.specialty}` : ""}</div>
            </div>
            <Button size="sm" variant={m.verified ? "outline" : "default"} onClick={async () => { await verify({ data: { userId: m.user_id, verified: !m.verified } }); qc.invalidateQueries({ queryKey: ["mentor-creds"] }); }}>
              {m.verified ? "Verificado · desfazer" : "Marcar como verificado"}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

function EvidenceAlerts() {
  const { data, isLoading } = useQuery({ queryKey: ["evidence-alerts"], queryFn: () => evidenceAlerts(), staleTime: 3_600_000 });
  return (
    <section className="mt-10">
      <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Alerta de atualização · novos ECR, metanálises e diretrizes (6 meses)</h2>
      <div className="mt-3 rounded-sm border border-border/60 p-4 text-sm">
        {isLoading ? <p className="text-muted-foreground">Buscando novidades…</p> : !data?.length ? <p className="text-muted-foreground">Nenhum estudo novo relevante para as aulas publicadas.</p> : (
          <div className="space-y-4">
            {data.map((a) => (
              <div key={a.lessonId}>
                <Link to="/editor/aula/$lessonId" params={{ lessonId: a.lessonId }} className="font-light text-primary">{a.lesson}</Link>
                <ul className="mt-1 space-y-1">
                  {a.hits.map((h) => <li key={h.url} className="text-xs text-muted-foreground"><a href={h.url} target="_blank" rel="noreferrer" className="underline">{h.title}</a> · {h.date}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
