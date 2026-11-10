/**
 * Cartógrafo — face do Cérebro que entrevista o médico e monta o mapa.
 * Socrático: UMA pergunta por vez; nunca entrega conduta de graça.
 */
import { generateText, Output, type ModelMessage } from "ai";
import { z } from "zod";
import {
  createGatewayOpenAI,
  doutivaChatModel,
  doutivaOpenAIProviderOptions,
} from "@/lib/ai-provider.server";
import {
  getMastery,
  getTopics,
  saveBrainSession,
  updateMastery,
} from "@/lib/brain/brain.server";
import type { CartographerTurnResult, ClinicalTopic } from "@/lib/brain/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

import { MAP_INTERVIEW_QUESTIONS } from "@/lib/brain/map-interview";

const SYSTEM = `Você é o Cartógrafo da Doutiva — o cérebro da escola do médico do futuro (AI-first).
Seu único trabalho nesta face: diagnosticar o que o médico JÁ sabe e o que NÃO sabe, tema a tema.
O aluno é SEMPRE médico formado.

Regras absolutas:
1. Uma pergunta clínica por vez, curta e precisa (máx. ~80 palavras na fala).
2. NÃO entregue a conduta correta antes de o médico se comprometer.
3. Após a resposta dele, calibre: score 0–100 + confiança (sei/acho/nao_sei).
4. Avance para o próximo tema do catálogo ainda sem avaliação (ou vermelho frágil).
5. Ancore-se em medicina de peptídeos / incretinas / eixo GH / reparo / regulação BR (ANVISA/CFM/WADA).
6. Português técnico, direto, respeitoso. Sem enrolação.
7. A entrevista tem tamanho fixo: exatamente ${MAP_INTERVIEW_QUESTIONS} perguntas/temas. Ao completar ${MAP_INTERVIEW_QUESTIONS} avaliações (ou todos os temas do catálogo, o que for menor), encerre com map_complete=true e um resumo de 2 linhas apontando Minha Trilha.
8. Na primeira fala, diga que serão ${MAP_INTERVIEW_QUESTIONS} perguntas e que no fim sai a trilha pessoal.`;

// OpenAI strict JSON schema: every key must appear in `required`.
// Use .nullable() (not .optional()) so absent values are explicit nulls.
const turnSchema = z.object({
  reply: z.string().describe("Mensagem ao médico (markdown simples, curta)"),
  probe: z
    .object({
      topic_id: z.string().describe("UUID do tema no catálogo"),
      topic_slug: z.string(),
      question: z.string(),
      rationale: z.string().nullable(),
    })
    .nullable(),
  assessment: z
    .object({
      topic_id: z.string().describe("UUID do tema avaliado"),
      score: z.number().min(0).max(100),
      confidence: z.number().min(0).max(1),
      confidence_label: z.enum(["sei", "acho", "nao_sei"]),
      note: z.string(),
    })
    .nullable(),
  map_complete: z.boolean(),
  summary: z.string().nullable(),
});
function catalogBlock(topics: ClinicalTopic[]) {
  return topics
    .map(
      (t) =>
        `- ${t.id} | ${t.slug} | ${t.title}${t.summary ? ` — ${t.summary}` : ""}`,
    )
    .join("\n");
}

function errorResponse(e: unknown) {
  const status = (e as { status?: number; statusCode?: number }).status
    ?? (e as { statusCode?: number }).statusCode
    ?? 500;
  const raw = String((e as Error).message ?? e);
  console.error("cartographer error", raw);
  const quota =
    status === 402 || /insufficient_quota|credit_balance_exhausted|credits? remaining/i.test(raw);
  const schema =
    /Invalid schema for response_format|invalid_json_schema|required.*Missing/i.test(raw);
  const msg = quota
    ? "Créditos da OpenAI esgotados. Adicione saldo em platform.openai.com → Settings → Billing."
    : status === 429
      ? "Muitas requisições, tente em instantes."
      : raw === "IA não configurada"
        ? "IA não configurada — defina OPENAI_API_KEY na Vercel."
        : schema
          ? "Falha no formato da resposta da IA (schema)."
          : "Falha no Cartógrafo.";
  return new Response(msg, {
    status: quota ? 402 : status === 500 && raw.includes("IA não") ? 500 : status >= 400 && status < 600 ? status : 500,
  });
}

export async function handleCartographer(request: Request) {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return new Response("Não autenticado", { status: 401 });

  const { createClient } = await import("@supabase/supabase-js");
  const {
    getSupabasePublishableKey,
    getSupabaseServerUrl,
  } = await import("@/integrations/supabase/env.server");

  const supabase = createClient<Database>(
    getSupabaseServerUrl(),
    getSupabasePublishableKey(),
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
  const { data: u } = await supabase.auth.getUser(token);
  if (!u.user) return new Response("Não autenticado", { status: 401 });

  const body = (await request.json()) as {
    messages?: { role: string; content: string }[];
    sessionId?: string;
    mode?: "turn" | "bootstrap";
  };

  const msgs = (body.messages ?? [])
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content,
    )
    .slice(-24)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.slice(0, 4000),
    })) as ModelMessage[];

  let topics: ClinicalTopic[];
  let mapSummary: string;
  try {
    topics = await getTopics(supabase as never);
    if (!topics.length) {
      return new Response(
        "Catálogo de temas ainda não migrado. Rode a migration 0026_brain_mastery_by_topic.",
        { status: 503 },
      );
    }
    const map = await getMastery(supabase as never, u.user.id);
    mapSummary = map.mastery
      .map((m) => {
        const t = m.topic;
        const state =
          m.attempts === 0 ? "não avaliado" : `${m.band} score=${m.score} conf=${m.confidence_avg}`;
        return `- ${t?.slug ?? m.topic_id}: ${state}`;
      })
      .join("\n");
  } catch (e) {
    console.error("cartographer catalog", e);
    return new Response(
      "Memória do cérebro indisponível (tabelas clinical_topics / mastery_by_topic). Aplique a migration 0026.",
      { status: 503 },
    );
  }

  let provider;
  try {
    provider = createGatewayOpenAI();
  } catch (e) {
    return errorResponse(e);
  }

  const model = doutivaChatModel(provider);
  const opts = doutivaOpenAIProviderOptions("low");
  const start: ModelMessage[] =
    msgs.length > 0
      ? msgs
      : [
          {
            role: "user",
            content:
              "Estou pronto para o mapa clínico. Comece calibrando o primeiro tema do catálogo.",
          },
        ];

  try {
    const result = await generateText({
      model,
      system: `${SYSTEM}

=== CATÁLOGO DE TEMAS (use topic_id UUID exato) ===
${catalogBlock(topics)}

=== MAPA ATUAL DO MÉDICO ===
${mapSummary}

Na sua resposta estruturada:
- Sempre preencha todos os campos; use null quando não couber probe/assessment/summary.
- Se estiver fazendo uma nova pergunta, preencha probe com topic_id do catálogo.
- Se o médico acabou de responder um tema, preencha assessment com score/confiança.
- Só marque map_complete=true quando cobrir a maior parte dos temas.`,
      messages: start,
      output: Output.object({ schema: turnSchema }),
      abortSignal: request.signal,
      providerOptions: opts,
    });

    const out = result.output as CartographerTurnResult;
    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

    const knownIds = new Set(topics.map((t) => t.id));
    // Normalize probe/assessment topic_id: model may invent slugs — map by slug fallback.
    if (out.probe && !knownIds.has(out.probe.topic_id)) {
      const bySlug = topics.find((t) => t.slug === out.probe?.topic_slug);
      if (bySlug) out.probe.topic_id = bySlug.id;
    }
    if (out.assessment && !knownIds.has(out.assessment.topic_id)) {
      const bySlug = topics.find(
        (t) =>
          out.probe?.topic_slug && t.slug === out.probe.topic_slug,
      );
      // Prefer current probe topic, else first unmatched / first topic
      out.assessment.topic_id = bySlug?.id ?? out.probe?.topic_id ?? topics[0]?.id;
    }

    if (out.assessment?.topic_id && knownIds.has(out.assessment.topic_id)) {
      const conf =
        typeof out.assessment.confidence === "number"
          ? out.assessment.confidence
          : out.assessment.confidence_label === "sei"
            ? 0.9
            : out.assessment.confidence_label === "acho"
              ? 0.55
              : 0.2;
      await updateMastery({
        userId: u.user.id,
        topicId: out.assessment.topic_id,
        score: clamp(out.assessment.score),
        confidence: conf,
        evidence: {
          source: "cartographer",
          label: out.assessment.confidence_label,
          note: out.assessment.note,
        },
      });
    }

    const map = await getMastery(supabase as never, u.user.id);
    const touched = map.mastery.filter((m) => m.attempts > 0).length;
    const target = Math.min(MAP_INTERVIEW_QUESTIONS, Math.max(1, topics.length));
    const forceComplete = touched >= target;
    const mapComplete = !!out.map_complete || forceComplete;
    const summary =
      out.summary ??
      (mapComplete
        ? `Mapa pronto (${touched}/${target}). Abra Minha Trilha para ver o que estudar agora.`
        : null);

    const sessionId = await saveBrainSession({
      supabase: supabase as never,
      userId: u.user.id,
      face: "cartographer",
      sessionId: body.sessionId,
      transcript: [...msgs, { role: "assistant", content: out.reply }],
      result: {
        assessment: out.assessment ?? null,
        probe: out.probe ?? null,
        map_complete: mapComplete,
        summary,
        progress: { done: touched, total: target },
      },
      status: mapComplete ? "completed" : "active",
    });

    return Response.json({
      reply: out.reply,
      probe: out.probe ?? null,
      assessment: out.assessment
        ? {
            ...out.assessment,
            score: clamp(out.assessment.score),
          }
        : null,
      map_complete: mapComplete,
      summary,
      progress: { done: touched, total: target },
      sessionId,
      map,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Lightweight health for brain faces. */
export async function cartographerHealth(supabase: SupabaseClient<Database>) {
  try {
    const topics = await getTopics(supabase as never);
    return { ok: topics.length > 0, topics: topics.length };
  } catch {
    return { ok: false, topics: 0 };
  }
}
