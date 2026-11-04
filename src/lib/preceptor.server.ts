import { Output, streamText, type ModelMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { PERSONAS, type PersonaId } from "@/lib/preceptor-personas";
import {
  createGatewayOpenAI,
  doutivaChatModel,
  doutivaOpenAIProviderOptions,
} from "@/lib/ai-provider.server";

const BASE = `Você é um Professor de IA da Doutiva — a escola do médico do futuro. Seu aluno é SEMPRE um médico formado.
Princípios pedagógicos (mastery learning, estilo Alpha School):
- Ensine pelo esforço do aluno: ele precisa raciocinar, não ler. Faça UMA pergunta por vez, curta e precisa.
- Comece calibrando o nível (pergunta diagnóstica) e suba a dificuldade conforme ele acerta; desça e reconstrua a base quando errar.
- Quando errar, não entregue a resposta de imediato: dê uma pista, depois outra; só explique após a 2ª tentativa, e então reteste com variação.
- Seja técnico, direto, em português. Ancore-se no conteúdo da aula. Nunca invente referências, números ou DOIs; se não souber, diga.
- Diferencie aprovado, off-label, manipulado e sem registro; respeite ANVISA, CFM e WADA.
- A cada 4–5 trocas, dê um feedback de 1 linha: "Domínio estimado: X/100 — ponto forte / lacuna".
- Mensagens curtas (máx. ~150 palavras), markdown simples.`;

const evalSchema = z.object({
  score: z.number().describe("Índice de domínio 0-100"),
  raciocinio: z.number().describe("Raciocínio clínico 0-100"),
  evidencia: z.number().describe("Domínio de evidência 0-100"),
  seguranca: z.number().describe("Segurança/regulatório 0-100"),
  comunicacao: z.number().describe("Clareza e precisão 0-100"),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  next_step: z.string(),
});

async function lessonContext(supabase: ReturnType<typeof createClient<Database>>, lessonId: string) {
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title, module_title, content, key_points, refs, evidence_level, position, slides, monograph, clinical_case, quick_ref, courses(slug)")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return null;
  const { resolveRich } = await import("@/content/lesson-normalize");
  const slug = (lesson.courses as { slug?: string } | null)?.slug ?? "";
  const rich = resolveRich(lesson, slug);
  const richCtx = rich
    ? `\n\n--- MONOGRAFIA ---\n${rich.monograph}\n\n--- GUIA DE BOLSO ---\n${rich.quickRef}\n\n--- CASO ---\n${rich.clinicalCase.vignette}`
    : "";
  return `\n\n=== AULA-BASE ===\n${lesson.module_title} — ${lesson.title}\nEvidência: ${lesson.evidence_level}\nPontos-chave: ${(lesson.key_points ?? []).join(" | ")}\n\n${lesson.content ?? ""}${richCtx}\n\nReferências: ${JSON.stringify(lesson.refs)}`;
}

function errorResponse(e: unknown) {
  const status = (e as { status?: number }).status ?? 500;
  const msg =
    status === 402
      ? "Créditos de IA esgotados."
      : status === 429
        ? "Muitas requisições, tente em instantes."
        : status === 403
          ? "Acesso à IA bloqueado para este espaço de trabalho."
          : (e as Error).message === "IA não configurada"
            ? "IA não configurada"
            : "Falha na IA.";
  return new Response(msg, { status: status === 500 && (e as Error).message === "IA não configurada" ? 500 : status });
}

export async function handlePreceptor(request: Request) {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return new Response("Não autenticado", { status: 401 });
  const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: u } = await supabase.auth.getUser(token);
  if (!u.user) return new Response("Não autenticado", { status: 401 });

  const body = (await request.json()) as {
    lessonId?: string;
    persona?: string;
    mode?: string;
    messages?: { role: string; content: string }[];
  };
  const persona = PERSONAS.find((p) => p.id === body.persona);
  const msgs = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content)
    .slice(-30)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 6000) })) as ModelMessage[];
  if (!persona || !body.lessonId) return new Response("Requisição inválida", { status: 400 });

  const ctx = await lessonContext(supabase, body.lessonId);
  if (!ctx) return new Response("Aula não encontrada", { status: 404 });

  let provider;
  try {
    provider = createGatewayOpenAI();
  } catch (e) {
    return errorResponse(e);
  }
  const opts = doutivaOpenAIProviderOptions("low");
  const model = doutivaChatModel(provider);

  if (body.mode === "evaluate") {
    const userTurns = msgs.filter((m) => m.role === "user").length;
    if (userTurns < 2) return new Response("Responda pelo menos 2 perguntas antes de encerrar.", { status: 400 });
    try {
      const transcript = msgs
        .map((m) => `${m.role === "user" ? "MÉDICO" : "PROFESSOR"}: ${m.content as string}`)
        .join("\n\n");
      const r = streamText({
        model,
        system: `Você é um avaliador rigoroso de banca médica. Avalie APENAS o desempenho do MÉDICO na transcrição, com base na aula-base. Seja justo e exigente: respostas vagas não pontuam alto. Lacunas e pontos fortes devem ser específicos e acionáveis (máx. 4 cada). next_step: a próxima ação concreta de estudo.${ctx}`,
        prompt: `Modo: ${persona.name}\n\nTRANSCRIÇÃO:\n${transcript}`,
        output: Output.object({ schema: evalSchema }),
        abortSignal: request.signal,
        providerOptions: opts,
      });
      const o = await r.output;
      const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
      const row = {
        user_id: u.user.id,
        lesson_id: body.lessonId,
        persona: persona.id,
        score: clamp(o.score),
        dimensions: {
          raciocinio: clamp(o.raciocinio),
          evidencia: clamp(o.evidencia),
          seguranca: clamp(o.seguranca),
          comunicacao: clamp(o.comunicacao),
        },
        strengths: o.strengths.slice(0, 4),
        gaps: o.gaps.slice(0, 4),
        next_step: o.next_step,
      };
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("mastery_records").insert(row);
      if (error) return new Response("Não foi possível salvar a avaliação.", { status: 500 });
      return Response.json(row);
    } catch (e) {
      return errorResponse(e);
    }
  }

  const start: ModelMessage[] = msgs.length ? msgs : [{ role: "user", content: "Estou pronto. Comece." }];
  try {
    const result = streamText({
      model,
      system: `${BASE}\n\n=== SUA PERSONA: ${persona.name} ===\n${persona.prompt}${ctx}`,
      messages: start,
      abortSignal: request.signal,
      providerOptions: opts,
    });
    return result.toTextStreamResponse();
  } catch (e) {
    return errorResponse(e);
  }
}

export type { PersonaId };
