import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LessonMarkdown } from "@/components/lesson-markdown";
import { Send, Sparkles, Square } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Resuma esta aula em 5 pontos para eu aplicar amanhã",
  "Qual o nível de evidência e as principais limitações?",
  "Crie um caso clínico desafiador sobre este tema",
  "Faça 3 perguntas de prova de título sobre esta aula",
];

export function LessonTutor({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  }, [lessonId]);

  useEffect(() => endRef.current?.scrollIntoView({ block: "nearest" }), [messages]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
        body: JSON.stringify({ lessonId, messages: next }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) throw new Error((await res.text()) || "Falha ao consultar a IA.");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
      if (!acc) throw new Error("A IA não retornou resposta.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
        setMessages((m) => (m[m.length - 1]?.content === "" ? m.slice(0, -1) : m));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[640px] flex-col rounded-sm border border-border/60 bg-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
        <Sparkles className="h-4 w-4 text-gold" />
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Tutor IA</div>
          <div className="text-xs text-muted-foreground line-clamp-1">Ancorado em: {lessonTitle}</div>
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Pergunte como faria a um preceptor. Respostas com nível de evidência e referências reais.</p>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="block w-full rounded-sm border border-border/60 px-3 py-2 text-left text-xs text-foreground/80 transition hover:border-gold/50 hover:text-foreground">
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-8 rounded-sm bg-secondary px-3 py-2 text-sm">{m.content}</div>
          ) : (
            <div key={i} className="text-sm [&_.lesson-md]:text-sm [&_.lesson-md]:leading-6">
              {m.content ? <LessonMarkdown>{m.content}</LessonMarkdown> : <span className="animate-pulse text-xs text-muted-foreground">Analisando a evidência…</span>}
            </div>
          ),
        )}
        {error && <div className="rounded-sm border border-destructive/40 px-3 py-2 text-xs text-destructive">{error}</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-border/60 p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          rows={2}
          placeholder="Ex.: Como ajustar a dose em DRC estágio 3?"
          className="flex-1 resize-none rounded-sm border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-gold/60"
        />
        {loading ? (
          <Button type="button" size="icon" variant="outline" onClick={() => abortRef.current?.abort()} aria-label="Parar"><Square className="h-4 w-4" /></Button>
        ) : (
          <Button type="submit" size="icon" className="bg-gold text-primary-foreground hover:bg-gold-soft" aria-label="Enviar"><Send className="h-4 w-4" /></Button>
        )}
      </form>
    </div>
  );
}
