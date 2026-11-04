import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import type { RichLesson, Slide } from "@/content/lesson-types";
import { toCase } from "@/content/lesson-normalize";
import {
  createGatewayAnthropic,
  createGatewayOpenAI,
  doutivaChatModel,
  doutivaOpenAIProviderOptions,
  requireAiApiKey,
  usesOpenAIDirect,
} from "@/lib/ai-provider.server";

const slideSchema = z.object({
  kind: z.string().describe("title | bullets | bars | flow | table | split | pearl"),
  title: z.string(),
  subtitle: z.string().nullable(),
  text: z.string().nullable().describe("pearl: frase central"),
  items: z.array(z.string()).describe("bullets: tópicos; flow: 'rótulo — detalhe'; bars: 'rótulo | valor numérico'; split: itens da coluna esquerda"),
  rightItems: z.array(z.string()).describe("split: itens da coluna direita"),
  leftLabel: z.string().nullable(),
  rightLabel: z.string().nullable(),
  head: z.array(z.string()).describe("table: cabeçalho"),
  rows: z.array(z.array(z.string())).describe("table: linhas"),
  unit: z.string().nullable(),
  source: z.string().nullable(),
  note: z.string().nullable(),
});

const lessonSchema = z.object({
  title: z.string(),
  description: z.string(),
  evidence_level: z.string(),
  duration_minutes: z.number(),
  key_points: z.array(z.string()),
  slides: z.array(slideSchema),
  monograph: z.string(),
  quick_ref: z.string(),
  clinical_case: z.object({
    title: z.string(), vignette: z.string(), question: z.string(), teaching: z.string(), reward: z.number(),
    data: z.array(z.object({ label: z.string(), value: z.string() })),
    options: z.array(z.object({ label: z.string(), correct: z.boolean(), rationale: z.string() })),
  }),
  refs: z.array(z.object({ citation: z.string(), url: z.string().nullable() })),
});

const SYSTEM = `Você é o autor-chefe da Doutiva — a escola do médico do futuro. Escreve aulas para MÉDICOS especialistas, em português do Brasil, com profundidade de tratado/UpToDate.
Regras inegociáveis:
- Use apenas estudos, diretrizes e números reais que você conhece com segurança. NUNCA invente referências, DOIs, números ou datas. Se não tiver certeza, escreva "verificar" ou omita.
- Indique nível de evidência (A: ECR fase 3/metanálise; B: fase 2/observacional robusto; C: farmacologia humana/série; D: pré-clínico).
- Separe claramente: registrado na indicação, off-label, manipulado, sem registro. Considere ANVISA, CFM e WADA quando pertinente.
- Monografia em markdown: 1.800–3.000 palavras, com seções numeradas (##), tabelas, mecanismo, evidência crítica, conduta prática passo a passo, monitoramento, segurança, aspectos regulatórios.
- 6 a 9 slides variados (comece com kind "title"; use bars para resultados de ensaios, table para comparações/doses, flow para algoritmos, split para contrastes, pearl para encerrar).
- Caso clínico realista com dados objetivos (6 itens), 4 alternativas plausíveis, exatamente 1 correta, justificativa em cada uma, e "teaching" em markdown.
- quick_ref: guia de bolso em markdown, curto, com tabelas e alertas.
- key_points: 4 a 6 frases objetivas. refs: 4 a 10 referências primárias reais (url só se tiver certeza, senão null).`;

function toSlideFromAi(s: z.infer<typeof slideSchema>): Slide | null {
  const t = s.title;
  switch (s.kind) {
    case "title": return { kind: "title", title: t, subtitle: s.subtitle ?? undefined };
    case "bullets": return { kind: "bullets", title: t, bullets: s.items, note: s.note ?? undefined };
    case "bars": return { kind: "bars", title: t, unit: s.unit ?? "", source: s.source ?? "", note: s.note ?? undefined,
      bars: s.items.map((it, i) => { const [label, v] = it.split("|"); return { label: (label ?? "").trim(), value: Number((v ?? "").replace(",", ".").replace(/[^\d.-]/g, "")) || 0, highlight: i === s.items.length - 1 }; }) };
    case "flow": return { kind: "flow", title: t, note: s.note ?? undefined, steps: s.items.map((it) => { const [label, detail] = it.split(/\s+—\s+|\s+-\s+/); return { label: (label ?? "").trim(), detail: detail?.trim() }; }) };
    case "table": return { kind: "table", title: t, head: s.head, rows: s.rows, source: s.source ?? undefined };
    case "split": return { kind: "split", title: t, left: { label: s.leftLabel ?? "", items: s.items }, right: { label: s.rightLabel ?? "", items: s.rightItems } };
    case "pearl": return { kind: "pearl", title: t, text: s.text ?? s.subtitle ?? "", source: s.source ?? undefined };
    default: return null;
  }
}

export type GeneratedLesson = {
  title: string; description: string; evidence_level: string; duration_minutes: number;
  key_points: string[]; refs: { citation: string; url?: string }[];
} & RichLesson & { audit: string };

const MONO_SYSTEM = `Você é o autor-chefe da Doutiva — a escola do médico do futuro. Escreva, em português do Brasil, a MONOGRAFIA de uma aula para médicos especialistas, com profundidade de tratado/UpToDate.
- Nunca invente estudos, DOIs, números ou datas; se incerto, escreva "(verificar)".
- Classifique evidência (A: ECR fase 3/metanálise; B: fase 2/observacional; C: farmacologia humana/série; D: pré-clínico).
- Separe registrado / off-label / manipulado / sem registro; considere ANVISA, CFM, WADA quando pertinente.
- Markdown com seções numeradas (##): 1. Contexto e relevância; 2. Fisiologia e mecanismo molecular; 3. Farmacologia; 4. Evidência crítica (ensaios nominais, desenho, n, desfechos, magnitude, limitações) com tabela; 5. Indicações e seleção de pacientes; 6. Conduta prática passo a passo (doses, titulação) com tabela; 7. Monitoramento; 8. Segurança, contraindicações e interações; 9. Aspectos regulatórios e éticos no Brasil; 10. Pérolas e armadilhas; 11. Referências (lista numerada de fontes primárias reais).
- 3.000 a 4.500 palavras. Responda apenas com a monografia.`;

const AUDIT_SYSTEM = `Você é revisor médico sênior (editor de periódico). Audite criticamente a aula fornecida para médicos. Liste, em markdown curto e objetivo (português):
## Possíveis erros factuais ou de dose
## Referências a verificar (suspeitas de imprecisão)
## Lacunas importantes
## Riscos regulatórios/éticos
## Veredito (Pronta para revisão humana / Requer correções)
Seja específico (cite o trecho). Não reescreva a aula.`;

function friendly(e: unknown): never {
  if (NoObjectGeneratedError.isInstance(e)) throw new Error("A IA não retornou uma aula válida. Tente novamente com um tema mais específico.");
  const status = (e as { status?: number }).status;
  if (status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos em Configurações → Planos.");
  if (status === 429) throw new Error("Muitas requisições. Aguarde um instante e tente de novo.");
  if (status === 403) throw new Error("Acesso ao modelo de IA bloqueado para este workspace.");
  throw e;
}

export async function generateLesson(input: { topic: string; courseTitle: string; moduleTitle: string; sources: string; notes: string }): Promise<GeneratedLesson> {
  requireAiApiKey();
  const openai = createGatewayOpenAI();
  const direct = usesOpenAIDirect();
  const anthropic = direct ? null : createGatewayAnthropic();

  const context = `Curso: ${input.courseTitle}\nMódulo: ${input.moduleTitle || "—"}\nTema da aula: ${input.topic}\n\nOrientações do mentor:\n${input.notes || "—"}\n\nMaterial-fonte fornecido (priorize-o e não contradiga):\n${input.sources.slice(0, 160000) || "—"}`;

  try {
    // Etapa 1 — monografia profunda (Claude Opus no gateway Lovable; GPT-4.1 na OpenAI direta).
    const mono = streamText({
      model: direct ? openai("gpt-4.1") : anthropic!("anthropic/claude-opus-5-5"),
      system: MONO_SYSTEM,
      prompt: context,
      maxOutputTokens: 32000,
      maxRetries: 0,
      providerOptions: direct ? undefined : { anthropic: { effort: "high" } },
    });
    const monograph = (await mono.text).trim();
    if (monograph.length < 2000) throw new Error("A monografia gerada ficou curta demais. Tente novamente.");

    // Etapa 2 — estrutura slides, caso, guia e referências a partir da monografia.
    const structured = streamText({
      model: doutivaChatModel(openai),
      system: SYSTEM + `\n\nA monografia já foi escrita por outro autor e é a fonte de verdade: devolva-a INTEGRALMENTE no campo monograph (sem resumir) e derive dela slides, caso, guia de bolso, pontos-chave e referências. Não introduza fatos ausentes da monografia.`,
      prompt: `${context}\n\n=== MONOGRAFIA ===\n${monograph}`,
      output: Output.object({ schema: lessonSchema }),
      providerOptions: doutivaOpenAIProviderOptions("medium"),
    });
    const o = await structured.output;

    // Etapa 3 — auditoria independente.
    const auditRun = streamText({
      model: direct ? openai("gpt-4.1-mini") : anthropic!("anthropic/claude-sonnet-5"),
      system: AUDIT_SYSTEM,
      prompt: `Tema: ${input.topic}\n\n=== MONOGRAFIA ===\n${monograph}\n\n=== CASO CLÍNICO ===\n${JSON.stringify(o.clinical_case)}\n\n=== GUIA DE BOLSO ===\n${o.quick_ref}`,
      maxOutputTokens: 4000,
      maxRetries: 0,
    });
    const audit = (await auditRun.text).trim();

    return {
      title: o.title, description: o.description, evidence_level: o.evidence_level,
      duration_minutes: Math.max(10, Math.round(o.duration_minutes || 40)),
      key_points: o.key_points,
      refs: o.refs.map((r) => ({ citation: r.citation, url: r.url ?? undefined })),
      slides: o.slides.map(toSlideFromAi).filter((s): s is Slide => !!s),
      monograph,
      quickRef: o.quick_ref,
      clinicalCase: toCase(o.clinical_case) ?? { title: "", vignette: "", data: [], question: "", options: [], teaching: "", reward: 0 },
      audit,
    };
  } catch (e) {
    friendly(e);
  }
}
