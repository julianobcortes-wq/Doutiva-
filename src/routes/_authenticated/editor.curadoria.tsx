import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  brainDraftGap,
  brainListGaps,
  brainPublishGap,
  brainRegisterDemand,
  brainRetrieve,
} from "@/lib/brain/gap.functions";
import { getClinicalTopics } from "@/lib/brain/brain.functions";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/editor/curadoria")({
  head: () => ({ meta: [{ title: "Curadoria · Cérebro — Doutiva" }] }),
  component: CuradoriaPage,
});

function CuradoriaPage() {
  const qc = useQueryClient();
  const listGaps = useServerFn(brainListGaps);
  const draft = useServerFn(brainDraftGap);
  const publish = useServerFn(brainPublishGap);
  const register = useServerFn(brainRegisterDemand);
  const retrieve = useServerFn(brainRetrieve);
  const topicsFn = useServerFn(getClinicalTopics);

  const gaps = useQuery({ queryKey: ["content-gaps"], queryFn: () => listGaps(), retry: 1 });
  const topics = useQuery({ queryKey: ["clinical-topics"], queryFn: () => topicsFn(), retry: 1 });

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<{ kind: string; title: string; score: number; snippet?: string }[]>([]);
  const [reviewer, setReviewer] = useState("Curadoria Doutiva");

  const retrieveMut = useMutation({
    mutationFn: () => retrieve({ data: { query } }),
    onSuccess: (data) => setHits(data),
    onError: (e: Error) => toast.error(e.message),
  });

  const demandMut = useMutation({
    mutationFn: (topicId: string) => register({ data: { topicId } }),
    onSuccess: (r) => {
      toast.success(r.action === "reuse" ? "Já existe aula — reutilizar" : "Gap registrado");
      qc.invalidateQueries({ queryKey: ["content-gaps"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const draftMut = useMutation({
    mutationFn: (gapId: string) => draft({ data: { gapId } }),
    onSuccess: (r) => {
      if (r.error) toast.error(r.error);
      else toast.success("Draft gerado");
      qc.invalidateQueries({ queryKey: ["content-gaps"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publishMut = useMutation({
    mutationFn: (gapId: string) => publish({ data: { gapId, reviewerName: reviewer } }),
    onSuccess: (r) => {
      if (!r.ok) toast.error(r.error || "Falha");
      else toast.success("Publicado — vira patrimônio da escola");
      qc.invalidateQueries({ queryKey: ["content-gaps"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 pb-28">
      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-gold">
        <Brain className="h-3.5 w-3.5" /> Estúdio vivo · Bibliotecário
      </div>
      <h1 className="mt-3 font-serif text-4xl">Curadoria do cérebro</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Recuperar o que existe. Se faltar, criar draft com IA. Publicar só com curadoria — ~90% EAD
        IA-first, sem corpo docente.
      </p>
      <Link to="/editor" className="mt-3 inline-block text-xs text-gold underline">
        Voltar ao Estúdio
      </Link>

      <section className="mt-10 border border-border/60 p-5">
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Bibliotecário — buscar no corpus
        </h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            retrieveMut.mutate();
          }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex.: incretinas SELECT massa magra"
            className="rounded-sm"
          />
          <Button type="submit" disabled={retrieveMut.isPending}>
            {retrieveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
          </Button>
        </form>
        <ul className="mt-4 space-y-2">
          {hits.map((h, i) => (
            <li key={`${h.title}-${i}`} className="border border-border/40 px-3 py-2 text-sm">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {h.kind} · {h.score.toFixed(1)}
              </span>
              <p className="font-medium">{h.title}</p>
              {h.snippet && <p className="text-xs text-muted-foreground">{h.snippet}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Abrir gap por tema
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(topics.data ?? []).map((t) => (
            <Button
              key={t.id}
              size="sm"
              variant="outline"
              disabled={demandMut.isPending}
              onClick={() => demandMut.mutate(t.id)}
            >
              {t.title}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Fila de gaps
          </h2>
          <Input
            className="max-w-xs rounded-sm"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            placeholder="Nome na publicação"
          />
        </div>
        {gaps.isError && (
          <p className="mt-4 text-sm text-muted-foreground">
            Aplique a migration 0027 para habilitar content_gaps.
          </p>
        )}
        <ul className="mt-4 space-y-3">
          {(gaps.data ?? []).map((g) => (
            <li key={g.id} className="border border-border/60 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {g.status} · demanda {g.demand_count}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">{g.topic_id}</p>
                  {g.draft_lesson_id && (
                    <p className="mt-1 text-xs">Draft: {g.draft_lesson_id}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(g.status === "open" || g.status === "drafting") && (
                    <Button
                      size="sm"
                      className="gap-1"
                      disabled={draftMut.isPending}
                      onClick={() => draftMut.mutate(g.id)}
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Gerar draft IA
                    </Button>
                  )}
                  {g.status === "in_review" && g.draft_lesson_id && (
                    <Button
                      size="sm"
                      disabled={publishMut.isPending}
                      onClick={() => publishMut.mutate(g.id)}
                    >
                      Publicar
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
