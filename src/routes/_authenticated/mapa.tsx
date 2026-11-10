import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, Flame, Loader2, Map as MapIcon, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonMarkdown } from "@/components/lesson-markdown";
import { supabase } from "@/integrations/supabase/client";
import { getMyMasteryMap } from "@/lib/brain/brain.functions";
import type { MasteryBand, MasteryMap } from "@/lib/brain/types";
import {
  MAP_INTERVIEW_MINUTES,
  MAP_INTERVIEW_QUESTIONS,
  mapInterviewSentence,
  mapProgressLabel,
  mapProgressPct,
} from "@/lib/brain/map-interview";

export const Route = createFileRoute("/_authenticated/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa clínico — Doutiva" },
      {
        name: "description",
        content:
          "Responda 8 perguntas clínicas e monte sua trilha pessoal na Doutiva.",
      },
      { property: "og:title", content: "Mapa clínico — Doutiva" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MapaPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const BAND_STYLE: Record<MasteryBand | "untouched", string> = {
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  yellow: "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  red: "border-rose-500/35 bg-rose-500/10 text-rose-800 dark:text-rose-200",
  untouched: "border-border/60 bg-muted/20 text-muted-foreground",
};

const BAND_LABEL: Record<MasteryBand, string> = {
  green: "Domina",
  yellow: "Parcial",
  red: "Lacuna",
};

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  return {
    "content-type": "application/json",
    authorization: `Bearer ${data.session?.access_token ?? ""}`,
  };
}

function MapaPage() {
  const qc = useQueryClient();
  const loadMap = useServerFn(getMyMasteryMap);
  const mapQuery = useQuery({
    queryKey: ["mastery-map"],
    queryFn: () => loadMap(),
    retry: 1,
  });

  const [mode, setMode] = useState<"map" | "interview">("map");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [completeSummary, setCompleteSummary] = useState<string | null>(null);
  const [progressOverride, setProgressOverride] = useState<{ done: number; total: number } | null>(
    null,
  );
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, mode]);

  const turn = useMutation({
    mutationFn: async (nextMessages: Msg[]) => {
      const headers = await authHeader();
      const res = await fetch("/api/brain/cartographer", {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: nextMessages, sessionId }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erro ${res.status}`);
      }
      return res.json() as Promise<{
        reply: string;
        sessionId?: string;
        map_complete?: boolean;
        summary?: string | null;
        map?: MasteryMap;
        progress?: { done: number; total: number };
      }>;
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (data.sessionId) setSessionId(data.sessionId);
      if (data.progress) setProgressOverride(data.progress);
      if (data.map) qc.setQueryData(["mastery-map"], data.map);
      else qc.invalidateQueries({ queryKey: ["mastery-map"] });
      if (data.map_complete) {
        setCompleteSummary(
          data.summary ?? "Mapa pronto. Abra Minha Trilha para ver o que estudar agora.",
        );
        setMode("map");
      }
    },
    onError: (e: Error) => setError(e.message),
  });

  async function startInterview() {
    setError(null);
    setCompleteSummary(null);
    setMessages([]);
    setSessionId(undefined);
    setProgressOverride({ done: 0, total: MAP_INTERVIEW_QUESTIONS });
    setMode("interview");
    turn.mutate([]);
  }

  async function send() {
    const text = input.trim();
    if (!text || turn.isPending) return;
    setInput("");
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    turn.mutate(next);
  }

  const map = mapQuery.data;
  const loadingMap = mapQuery.isLoading;
  const target = Math.min(
    MAP_INTERVIEW_QUESTIONS,
    Math.max(1, map?.topics.length || MAP_INTERVIEW_QUESTIONS),
  );
  const touchedFromMap = useMemo(
    () => (map?.mastery ?? []).filter((m) => m.attempts > 0).length,
    [map],
  );
  const done = progressOverride?.done ?? touchedFromMap;
  const total = progressOverride?.total ?? target;
  const pct = mapProgressPct(done, total);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6">
      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-primary">
        <Compass className="h-3.5 w-3.5" /> Cérebro Doutiva · Cartógrafo
      </div>
      <h1 className="mt-3 font-serif text-4xl font-light tracking-tight sm:text-5xl">
        Seu mapa clínico
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
        {mapInterviewSentence()}
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button
          variant={mode === "map" ? "default" : "outline"}
          size="sm"
          className="gap-2"
          onClick={() => setMode("map")}
        >
          <MapIcon className="h-3.5 w-3.5" /> Mapa
        </Button>
        <Button
          variant={mode === "interview" ? "default" : "outline"}
          size="sm"
          className="gap-2"
          onClick={() => (messages.length ? setMode("interview") : startInterview())}
          disabled={turn.isPending}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {map?.ready ? "Recalibrar com IA" : `Começar · ${MAP_INTERVIEW_QUESTIONS} perguntas`}
        </Button>
        {map?.ready && (
          <>
            <Button asChild size="sm" className="gap-2">
              <Link to="/trilha">
                <Sparkles className="h-3.5 w-3.5" /> Abrir Minha Trilha
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/caso-do-dia">
                <Flame className="h-3.5 w-3.5" /> Ir ao Caso do Dia
              </Link>
            </Button>
          </>
        )}
      </div>

      {completeSummary && (
        <div className="mt-6 border border-primary/25 bg-primary/5 px-4 py-3 text-sm leading-relaxed">
          {completeSummary}
          <div className="mt-3">
            <Button asChild size="sm" className="gap-2">
              <Link to="/trilha">Ver Minha Trilha montada a partir deste mapa</Link>
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {mode === "map" ? (
        <section className="mt-10">
          {loadingMap ? (
            <p className="text-sm text-muted-foreground">Lendo sua memória no cérebro…</p>
          ) : mapQuery.isError ? (
            <div className="border border-border/60 px-5 py-8 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Mapa ainda não disponível no banco.</p>
              <p className="mt-2">
                Aplique a migration{" "}
                <code className="text-xs">0026_brain_mastery_by_topic.sql</code> no Supabase e
                recarregue.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                <Stat label="Domina" value={map?.counts.green ?? 0} />
                <Stat label="Parcial" value={map?.counts.yellow ?? 0} />
                <Stat label="Lacuna" value={map?.counts.red ?? 0} />
                <Stat label="Ainda não visto" value={map?.counts.untouched ?? 0} />
              </div>

              {!map?.ready && (
                <div className="mt-8 border border-dashed border-border/70 px-5 py-6">
                  <p className="text-sm text-muted-foreground">{mapInterviewSentence()}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Sem o mapa, o Caso do Dia continua genérico e a trilha não personaliza.
                  </p>
                  <Button className="mt-4 gap-2" onClick={startInterview} disabled={turn.isPending}>
                    <Sparkles className="h-4 w-4" />
                    Iniciar mapa · {MAP_INTERVIEW_QUESTIONS} perguntas
                  </Button>
                </div>
              )}

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {(map?.mastery ?? []).map((row) => {
                  const untouched = row.attempts === 0;
                  const band = untouched ? "untouched" : row.band;
                  return (
                    <li key={row.topic_id} className={`border px-4 py-4 ${BAND_STYLE[band]}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.25em] opacity-70">
                            {row.topic?.specialty ?? "tema"}
                          </p>
                          <h3 className="mt-1 font-serif text-lg leading-snug text-foreground">
                            {row.topic?.title ?? row.topic_id}
                          </h3>
                          {row.topic?.summary && (
                            <p className="mt-1 text-xs opacity-80">{row.topic.summary}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.2em]">
                          {untouched ? "Não visto" : BAND_LABEL[row.band]}
                        </span>
                      </div>
                      {!untouched && (
                        <div className="mt-3 flex items-center gap-3 text-xs opacity-80">
                          <span>Índice {row.score}</span>
                          <span>·</span>
                          <span>
                            {row.attempts} calibraç{row.attempts === 1 ? "ão" : "ões"}
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      ) : (
        <section className="mt-8 flex min-h-[28rem] flex-col border border-border/60">
          <div className="border-b border-border/60 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {mapProgressLabel(done, total)}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                ~{MAP_INTERVIEW_MINUTES} min · uma por vez
              </p>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gold transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {done}/{total} respondidas — no fim aparece Minha Trilha.
            </p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {messages.length === 0 && turn.isPending && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Cartógrafo preparando a pergunta 1…
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={
                  m.role === "assistant"
                    ? "max-w-[92%] border border-border/50 bg-muted/30 px-4 py-3 text-sm"
                    : "ml-auto max-w-[92%] border border-primary/20 bg-primary/5 px-4 py-3 text-sm"
                }
              >
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {m.role === "assistant" ? "Cartógrafo" : "Você"}
                </p>
                {m.role === "assistant" ? (
                  <LessonMarkdown>{m.content}</LessonMarkdown>
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            className="flex gap-2 border-t border-border/60 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              className="min-w-0 flex-1 border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
              placeholder="Responda com raciocínio clínico…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={turn.isPending}
            />
            <Button type="submit" size="icon" disabled={turn.isPending || !input.trim()}>
              {turn.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border/60 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-3xl font-light tabular-nums">{value}</p>
    </div>
  );
}
