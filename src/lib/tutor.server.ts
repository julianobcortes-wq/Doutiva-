import { streamText, type ModelMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { gateCorpusCitations } from "@/lib/citations";
import { doutivaChatModel, doutivaOpenAIProviderOptions } from "@/lib/ai-provider.server";

const SYSTEM = `Você é o Tutor IA da Doutiva — a escola do médico do futuro. Seu interlocutor é sempre um MÉDICO.
Regras inegociáveis:
- Responda em português, com linguagem técnica de nível de especialista, direta e estruturada (use markdown, tabelas quando útil).
- Baseie-se PRIMEIRO no conteúdo da aula fornecido. Ao trazer conhecimento externo, cite apenas ensaios/diretrizes reais e conhecidos (nome do estudo, revista, ano). NUNCA invente referências, números ou DOIs; se não tiver certeza, diga explicitamente.
- Quando houver BIBLIOTECA CIENTÍFICA com [S#], cite APENAS índices presentes nessa lista. Não invente [S7] se só existem [S1]–[S6].
- Sempre indique o nível de evidência (A: ECRs/metanálises; B: ECR único/observacional robusto; C: série de casos/fase 1-2; D: pré-clínico/opinião).
- Diferencie claramente: aprovado, off-label, manipulado e sem registro. Respeite ANVISA, CFM (incl. Resolução 2.333/2023) e WADA.
- Em casos clínicos, conduza raciocínio: hipótese, exclusões, conduta, monitoramento.
- Termine respostas clínicas lembrando que a decisão é do médico assistente, individualizada.`;

function streamGatedText(text: string): Response {
  const encoder = new TextEncoder();
  const chunkSize = 48;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (let i = 0; i < text.length; i += chunkSize) {
        controller.enqueue(encoder.encode(text.slice(i, i + chunkSize)));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Doutiva-Citation-Gate": "1",
    },
  });
}

export async function handleTutor(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return new Response("Não autenticado", { status: 401 });

  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: u } = await supabase.auth.getUser(token);
  if (!u.user) return new Response("Não autenticado", { status: 401 });

  const body = (await request.json()) as { lessonId?: string; messages?: { role: string; content: string }[] };
  const msgs = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 6000) })) as ModelMessage[];
  if (!msgs.length || !body.lessonId) return new Response("Requisição inválida", { status: 400 });

  const { data: lesson } = await supabase
    .from("lessons")
    .select("title, module_title, content, key_points, refs, evidence_level, position, slides, monograph, clinical_case, quick_ref, courses(slug)")
    .eq("id", body.lessonId)
    .maybeSingle();
  if (!lesson) return new Response("Aula não encontrada", { status: 404 });

  const { resolveRich } = await import("@/content/lesson-normalize");
  const slug = (lesson.courses as { slug?: string } | null)?.slug ?? "";
  const rich = resolveRich(lesson, slug);
  const richCtx = rich
    ? `\n\n--- MONOGRAFIA ---\n${rich.monograph}\n\n--- GUIA DE BOLSO ---\n${rich.quickRef}\n\n--- CASO CLÍNICO DA AULA ---\n${rich.clinicalCase.vignette}`
    : "";

  const context = `\n\n=== AULA ATUAL ===\n${lesson.module_title} — ${lesson.title}\nNível de evidência: ${lesson.evidence_level}\nPontos-chave: ${(lesson.key_points ?? []).join(" | ")}\n\n${lesson.content ?? ""}${richCtx}\n\nReferências da aula:\n${JSON.stringify(lesson.refs)}`;

  const lastQ = [...msgs].reverse().find((m) => m.role === "user")?.content as string | undefined;
  const q = `${lesson.title} ${lastQ ?? ""}`.slice(0, 2000);

  // Retrieval only — embeddings for pending sources happen on library import, not on every tutor turn.
  let found: {
    title: string;
    authors: string | null;
    journal: string | null;
    year: number | null;
    doi: string | null;
    url: string | null;
    evidence_level: string | null;
    excerpt: string;
  }[] | null = null;
  try {
    const { embedTexts } = await import("./embeddings.server");
    const vec = await embedTexts([q]);
    if (vec) {
      const { data } = await supabase.rpc("match_sources", { _embedding: JSON.stringify(vec[0]), _limit: 6 });
      found = (data ?? []).filter((s) => (s.similarity ?? 0) > 0.35);
    }
  } catch {
    /* fall back */
  }
  if (!found?.length) {
    const { data } = await supabase.rpc("search_sources", { _q: q.slice(0, 800), _limit: 6 });
    found = data;
  }
  const corpusSize = found?.length ?? 0;
  const corpus = (found ?? [])
    .map(
      (s, i) =>
        `[S${i + 1}] ${s.title} — ${s.authors ?? ""} ${s.journal ?? ""} ${s.year ?? ""} ${s.doi ? "doi:" + s.doi : s.url ?? ""} (evidência: ${s.evidence_level ?? "n/d"})\n${s.excerpt}`,
    )
    .join("\n\n");
  const libraryCtx = corpus
    ? `\n\n=== BIBLIOTECA CIENTÍFICA DOUTIVA (cite como [S#]) ===\n${corpus}\n\nREGRA: toda afirmação clínica baseada nessas fontes DEVE trazer a citação [S#] correspondente (somente 1–${corpusSize}). Ao final, liste "Fontes" com cada [S#] usado. Se nenhuma fonte cobre a pergunta, diga isso explicitamente.`
    : "\n\n(Nenhuma fonte da Biblioteca cobre esta pergunta; avise o médico que a resposta não está ancorada no acervo. NÃO invente marcações [S#].)";

  try {
    const result = streamText({
      model: doutivaChatModel(),
      system: SYSTEM + context + libraryCtx,
      messages: msgs,
      abortSignal: request.signal,
      providerOptions: doutivaOpenAIProviderOptions("medium"),
    });
    const raw = await result.text;
    const gated = gateCorpusCitations(raw, corpusSize);
    return streamGatedText(gated.text);
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return new Response(
      status === 402
        ? "Créditos de IA esgotados."
        : status === 429
          ? "Muitas requisições, tente em instantes."
          : status === 500 && (e as Error).message === "IA não configurada"
            ? "IA não configurada"
            : "Falha na IA.",
      { status },
    );
  }
}
