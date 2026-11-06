import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LessonMarkdown } from "@/components/lesson-markdown";
import { PERSONAS, type PersonaId } from "@/lib/preceptor-personas";
import { Brain, Gauge, Send, Square, Trophy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/professores")({
  head: () => ({
    meta: [
      { title: "Professores de IA — Doutiva" },
      {
        name: "description",
        content:
          "Sabatina socrática, banca de título, plantão simulado e journal club com professores de IA treinados nas aulas da Doutiva.",
      },
      { property: "og:title", content: "Professores de IA — Doutiva" },
      {
        property: "og:description",
        content:
          "Treine domínio clínico real com professores de IA e acompanhe seu Índice de Domínio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Professores,
});

type Msg = { role: "user" | "assistant"; content: string };
type Evaluation = {
  score: number;
  dimensions: Record<string, number>;
  strengths: string[];
  gaps: string[];
  next_step: string | null;
};

const DIM_LABEL: Record<string, string> = {
  raciocinio: "Raciocínio clínico",
  evidencia: "Evidência",
  seguranca: "Segurança e regulação",
  comunicacao: "Precisão",
};

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  return {
    "content-type": "application/json",
    authorization: `Bearer ${data.session?.access_token ?? ""}`,
  };
}

function Professores() {
  const qc = useQueryClient();
  const lessons = useQuery({
    queryKey: ["preceptor-lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, module_title, courses(title)")
        .eq("status", "published")
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
    retry: 1,
  });
  const history = useQuery({
    queryKey: ["mastery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mastery_records")
        .select("id, lesson_id, persona, score, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    retry: 1,
  });

  const [persona, setPersona] = useState<PersonaId>("socratico");
  const [lessonId, setLessonId] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Evaluation | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lessonId && lessons.data?.[0]) setLessonId(lessons.data[0].id);
  }, [lessons.data, lessonId]);
  useEffect(() => {
    // scrollIntoView may return a Promise in Chromium; never return that from useEffect.
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  const started = messages.length > 0;
  const p = PERSONAS.find((x) => x.id === persona)!;
  const lessonTitle = (id: string) => lessons.data?.find((l) => l.id === id)?.title ?? "Aula";

  async function stream(next: Msg[]) {
    setError(null);
    setMessages([...next, { role: "assistant", content: "" }]);
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/preceptor", {
        method: "POST",
        headers: await authHeader(),
        body: JSON.stringify({ lessonId, persona, messages: next }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body)
        throw new Error((await res.text()) || "Falha ao consultar o professor.");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
      if (!acc) throw new Error("O professor não respondeu.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
        setMessages((m) => (m[m.length - 1]?.content === "" ? m.slice(0, -1) : m));
      }
    } finally {
      setLoading(false);
    }
  }

  function begin() {
    setResult(null);
    stream([]);
  }
  function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    stream([...messages, { role: "user", content: q }]);
  }
  async function evaluate() {
    setEvaluating(true);
    setError(null);
    try {
      const res = await fetch("/api/preceptor", {
        method: "POST",
        headers: await authHeader(),
        body: JSON.stringify({ lessonId, persona, mode: "evaluate", messages }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Falha na avaliação.");
      setResult((await res.json()) as Evaluation);
      qc.invalidateQueries({ queryKey: ["mastery"] });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEvaluating(false);
    }
  }
  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    setResult(null);
    setError(null);
  }

  const avg = history.data?.length
    ? Math.round(history.data.reduce((s, r) => s + r.score, 0) / history.data.length)
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.35em] text-gold">Corpo docente de IA</div>
        <h1 className="text-3xl font-light tracking-tight md:text-4xl">Professores de IA</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Você não assiste aula: você é sabatinado. Escolha o professor e o tema, responda, e receba
          seu Índice de Domínio com lacunas específicas para estudar.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {!started && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {PERSONAS.map((x) => (
                  <button
                    key={x.id}
                    onClick={() => setPersona(x.id)}
                    className={`rounded-sm border p-4 text-left transition ${persona === x.id ? "border-gold bg-gold/5" : "border-border/60 hover:border-gold/40"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-light">{x.name}</span>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-gold">
                        {x.tag}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{x.description}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Tema (aula-base)
                </label>
                <select
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                  className="w-full rounded-sm border border-border/60 bg-background px-3 py-2 text-sm"
                >
                  {lessons.data?.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.module_title} — {l.title}
                    </option>
                  ))}
                </select>
                {lessons.isError && (
                  <p className="text-xs text-destructive">
                    Não foi possível carregar as aulas
                    {lessons.error instanceof Error ? `: ${lessons.error.message}` : "."}
                  </p>
                )}
                {lessons.data && lessons.data.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhuma aula publicada ainda.</p>
                )}
              </div>
              <Button
                onClick={begin}
                disabled={!lessonId}
                className="bg-gold text-primary-foreground hover:bg-gold-soft"
              >
                <Brain className="mr-2 h-4 w-4" />
                Começar sabatina
              </Button>
            </>
          )}

          {started && (
            <div className="flex h-[620px] flex-col rounded-sm border border-border/60 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-5 py-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-gold">{p.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {lessonTitle(lessonId)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={reset}>
                    Nova sessão
                  </Button>
                  <Button
                    size="sm"
                    onClick={evaluate}
                    disabled={loading || evaluating || !!result}
                    className="bg-gold text-primary-foreground hover:bg-gold-soft"
                  >
                    <Gauge className="mr-1 h-4 w-4" />
                    {evaluating ? "Avaliando…" : "Encerrar e avaliar"}
                  </Button>
                </div>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="ml-10 rounded-sm bg-secondary px-3 py-2 text-sm">
                      {m.content}
                    </div>
                  ) : (
                    <div
                      key={i}
                      className="text-sm [&_.lesson-md]:text-sm [&_.lesson-md]:leading-6"
                    >
                      {m.content ? (
                        <LessonMarkdown>{m.content}</LessonMarkdown>
                      ) : (
                        <span className="animate-pulse text-xs text-muted-foreground">
                          O professor está pensando…
                        </span>
                      )}
                    </div>
                  ),
                )}
                {error && (
                  <div className="rounded-sm border border-destructive/40 px-3 py-2 text-xs text-destructive">
                    {error}
                  </div>
                )}
                <div ref={endRef} />
              </div>
              {!result && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                  className="flex gap-2 border-t border-border/60 p-3"
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    rows={2}
                    placeholder="Sua resposta, doutor(a)…"
                    className="flex-1 resize-none rounded-sm border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-gold/60"
                  />
                  {loading ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => abortRef.current?.abort()}
                      aria-label="Parar"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="icon"
                      className="bg-gold text-primary-foreground hover:bg-gold-soft"
                      aria-label="Enviar"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </form>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-4 rounded-sm border border-gold/40 bg-card p-6">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-extralight text-gold">{result.score}</span>
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Índice de Domínio
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(result.dimensions).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs">
                      <span>{DIM_LABEL[k] ?? k}</span>
                      <span className="text-muted-foreground">{v}</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-secondary">
                      <div className="h-1 rounded-full bg-gold" style={{ width: `${v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-[0.3em] text-gold">
                    Pontos fortes
                  </div>
                  <ul className="list-disc space-y-1 pl-4 text-sm">
                    {result.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-[0.3em] text-destructive">
                    Lacunas
                  </div>
                  <ul className="list-disc space-y-1 pl-4 text-sm">
                    {result.gaps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {result.next_step && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Próximo passo: </span>
                  {result.next_step}
                </p>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-3 rounded-sm border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Seu domínio</span>
          </div>
          <div className="text-3xl font-extralight">
            {avg ?? "—"}
            <span className="text-sm text-muted-foreground"> /100</span>
          </div>
          <div className="space-y-2">
            {history.data?.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Faça sua primeira sabatina para gerar seu índice.
              </p>
            )}
            {history.data?.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between border-t border-border/40 pt-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="line-clamp-1">{lessonTitle(r.lesson_id)}</div>
                  <div className="text-muted-foreground">
                    {PERSONAS.find((x) => x.id === r.persona)?.name}
                  </div>
                </div>
                <span className="ml-2 text-gold">{r.score}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
