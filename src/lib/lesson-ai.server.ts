import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import type { RichLesson, Slide } from "@/content/lesson-types";
import { toCase } from "@/content/lesson-normalize";
import {
  createGatewayAnthropic,
  createGatewayOpenAI,
  doutivaChatModel,
  doutivaClaudeAuditModel,
  doutivaClaudeTreatiseModel,
  doutivaOpenAIProviderOptions,
  hasAnthropicDirect,
  requireAiApiKey,
  usesOpenAIDirect,
} from "@/lib/ai-provider.server";

const slideSchema = z.object({
  kind: z.string().describe("title | bullets | bars | flow | table | split | pearl"),
  title: z.string(),
  subtitle: z.string().nullable(),
  text: z.string().nullable().describe("pearl: frase central"),
  items: z
    .array(z.string())
    .describe(
      "bullets: tópicos; flow: 'rótulo — detalhe'; bars: 'rótulo | valor numérico'; split: itens da coluna esquerda",
    ),
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
    title: z.string(),
    vignette: z.string(),
    question: z.string(),
    teaching: z.string(),
    reward: z.number(),
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
- Monografia em markdown: a monografia JÁ FOI ESCRITA — devolva-a INTEGRALMENTE no campo monograph (sem resumir, sem truncar).
- 8 a 12 slides variados (comece com kind "title"; use bars para resultados de ensaios, table para comparações/doses, flow para algoritmos, split para contrastes, pearl para encerrar). Inclua pelo menos 1 table de doses/ensaios e 1 flow de algoritmo clínico.
- Caso clínico realista com dados objetivos (6–8 itens), 4 alternativas plausíveis, exatamente 1 correta, justificativa em cada uma, e "teaching" em markdown denso.
- quick_ref: guia de bolso em markdown com tabelas de dose, red flags e checklist de consultório.
- key_points: 5 a 7 frases clínicas acionáveis. refs: 6 a 12 referências primárias reais (url só se tiver certeza, senão null).`;

function toSlideFromAi(s: z.infer<typeof slideSchema>): Slide | null {
  const t = s.title;
  switch (s.kind) {
    case "title":
      return { kind: "title", title: t, subtitle: s.subtitle ?? undefined };
    case "bullets":
      return { kind: "bullets", title: t, bullets: s.items, note: s.note ?? undefined };
    case "bars":
      return {
        kind: "bars",
        title: t,
        unit: s.unit ?? "",
        source: s.source ?? "",
        note: s.note ?? undefined,
        bars: s.items.map((it, i) => {
          const [label, v] = it.split("|");
          return {
            label: (label ?? "").trim(),
            value: Number((v ?? "").replace(",", ".").replace(/[^\d.-]/g, "")) || 0,
            highlight: i === s.items.length - 1,
          };
        }),
      };
    case "flow":
      return {
        kind: "flow",
        title: t,
        note: s.note ?? undefined,
        steps: s.items.map((it) => {
          const [label, detail] = it.split(/\s+—\s+|\s+-\s+/);
          return { label: (label ?? "").trim(), detail: detail?.trim() };
        }),
      };
    case "table":
      return { kind: "table", title: t, head: s.head, rows: s.rows, source: s.source ?? undefined };
    case "split":
      return {
        kind: "split",
        title: t,
        left: { label: s.leftLabel ?? "", items: s.items },
        right: { label: s.rightLabel ?? "", items: s.rightItems },
      };
    case "pearl":
      return {
        kind: "pearl",
        title: t,
        text: s.text ?? s.subtitle ?? "",
        source: s.source ?? undefined,
      };
    default:
      return null;
  }
}

export type GeneratedLesson = {
  title: string;
  description: string;
  evidence_level: string;
  duration_minutes: number;
  key_points: string[];
  refs: { citation: string; url?: string }[];
} & RichLesson & { audit: string };

const MONO_SYSTEM = `Você é o autor-chefe da Doutiva — escola médica independente. Escreve para MÉDICOS exigentes (endocrino, nutrologia, clínica, longevidade), em português do Brasil, com profundidade de tratado/capítulo de textbook — nunca blog, nunca hype de rede social. Não mencione marcas comerciais de farmácia, laboratório ou parceiros; foque só em educação clínica e regulatório.
- Nunca invente estudos, DOIs, números ou datas; se incerto, escreva "(verificar)".
- Classifique evidência (A: ECR fase 3/metanálise/diretriz; B: fase 2/observacional robusto; C: farmacologia humana/série; D: pré-clínico/opinião).
- Separe registrado ANVISA / off-label documentado / manipulado / sem registro; considere CFM (incl. 2.333/2023 quando hormônio/estética), ANVISA, WADA e boas práticas de manipulação estéril quando pertinente.
- Quando o tema for terapêutica: inclua doses, vias, estabilidade/cuidados do frasco se injetável, monitoramento e o que NÃO prescrever.
- Quando o tema for IA/fluxo digital: foque evidência de desempenho, vieses, LGPD, responsabilidade médica, validação clínica e integração ao prontuário — sem vender ferramenta específica.
- Markdown com seções numeradas (##), adaptando títulos ao tema, cobrindo tipicamente: contexto e relevância; bases científicas; evidência crítica com ≥1 tabela densa (n, desfechos, magnitudes); seleção de pacientes/casos de uso; conduta ou fluxo passo a passo com tabela; monitoramento/segurança; regulatório e ético no Brasil; o que não fazer; pérolas e checklist; referências reais.
- 4.500 a 7.000 palavras. Tom sóbrio, acionável, premium. Responda apenas com a monografia.`;

const AUDIT_SYSTEM = `Você é revisor médico sênior (editor de periódico). Audite criticamente a aula fornecida para médicos. Liste, em markdown curto e objetivo (português):
## Possíveis erros factuais ou de dose
## Referências a verificar (suspeitas de imprecisão)
## Lacunas importantes
## Riscos regulatórios/éticos
## Veredito (Pronta para revisão humana / Requer correções)
Seja específico (cite o trecho). Não reescreva a aula.`;

function friendly(e: unknown): never {
  if (NoObjectGeneratedError.isInstance(e))
    throw new Error(
      "A IA não retornou uma aula válida. Tente novamente com um tema mais específico.",
    );
  const status = (e as { status?: number }).status;
  const raw = String((e as Error)?.message ?? e);
  if (status === 402 || /insufficient_quota|credit_balance_exhausted/i.test(raw)) {
    throw new Error(
      "Créditos da OpenAI esgotados. Adicione saldo em platform.openai.com → Settings → Billing.",
    );
  }
  if (status === 429) throw new Error("Muitas requisições. Aguarde um instante e tente de novo.");
  if (status === 403) throw new Error("Acesso ao modelo de IA bloqueado para este workspace.");
  throw e;
}

export async function generateLesson(input: {
  topic: string;
  courseTitle: string;
  moduleTitle: string;
  sources: string;
  notes: string;
}): Promise<GeneratedLesson> {
  requireAiApiKey();
  const openai = createGatewayOpenAI();
  const useClaude = hasAnthropicDirect();
  const anthropic = useClaude ? createGatewayAnthropic() : null;
  const direct = usesOpenAIDirect();

  const context = `Curso: ${input.courseTitle}\nMódulo: ${input.moduleTitle || "—"}\nTema da aula: ${input.topic}\n\nOrientações do mentor:\n${input.notes || "—"}\n\nMaterial-fonte fornecido (priorize-o e não contradiga):\n${input.sources.slice(0, 160000) || "—"}`;

  try {
    // Etapa 1 — monografia: Claude Opus (se key) > Lovable Claude > GPT-4.1.
    const mono = streamText({
      model: useClaude
        ? anthropic!(doutivaClaudeTreatiseModel())
        : direct
          ? openai("gpt-4.1")
          : createGatewayAnthropic()("anthropic/claude-opus-5-5"),
      system: MONO_SYSTEM,
      prompt: context,
      maxOutputTokens: 48000,
      maxRetries: 0,
      providerOptions: useClaude || !direct ? { anthropic: { effort: "high" } } : undefined,
    });
    const monograph = (await mono.text).trim();
    if (monograph.length < 2000)
      throw new Error("A monografia gerada ficou curta demais. Tente novamente.");

    // Etapa 2 — estrutura: sempre OpenAI (barato/estável para JSON).
    const structured = streamText({
      model: doutivaChatModel(openai),
      system:
        SYSTEM +
        `\n\nA monografia já foi escrita por outro autor e é a fonte de verdade: devolva-a INTEGRALMENTE no campo monograph (sem resumir) e derive dela slides, caso, guia de bolso, pontos-chave e referências. Não introduza fatos ausentes da monografia.`,
      prompt: `${context}\n\n=== MONOGRAFIA ===\n${monograph}`,
      output: Output.object({ schema: lessonSchema }),
      providerOptions: doutivaOpenAIProviderOptions("medium"),
    });
    const o = await structured.output;

    // Etapa 3 — auditoria: Claude Haiku (se key) > GPT-mini.
    const auditRun = streamText({
      model: useClaude
        ? anthropic!(doutivaClaudeAuditModel())
        : direct
          ? openai("gpt-4.1-mini")
          : createGatewayAnthropic()("anthropic/claude-sonnet-5"),
      system: AUDIT_SYSTEM,
      prompt: `Tema: ${input.topic}\n\n=== MONOGRAFIA ===\n${monograph}\n\n=== CASO CLÍNICO ===\n${JSON.stringify(o.clinical_case)}\n\n=== GUIA DE BOLSO ===\n${o.quick_ref}`,
      maxOutputTokens: 4000,
      maxRetries: 0,
    });
    const audit = (await auditRun.text).trim();

    return {
      title: o.title,
      description: o.description,
      evidence_level: o.evidence_level,
      duration_minutes: Math.max(10, Math.round(o.duration_minutes || 40)),
      key_points: o.key_points,
      refs: o.refs.map((r) => ({ citation: r.citation, url: r.url ?? undefined })),
      slides: o.slides.map(toSlideFromAi).filter((s): s is Slide => !!s),
      monograph,
      quickRef: o.quick_ref,
      clinicalCase: toCase(o.clinical_case) ?? {
        title: "",
        vignette: "",
        data: [],
        question: "",
        options: [],
        teaching: "",
        reward: 0,
      },
      audit,
    };
  } catch (e) {
    friendly(e);
  }
}

const RAISE_BAR_NOTES = `PADRÃO RAISE-BAR DOUTIVA (meta profundidade 8,5–9/10):
- Toda afirmação numérica de ensaio (n, %, HR, IC95%, dose rotulada) deve citar [S#] do material-fonte OU trazer "(verificar — não ancorado)".
- Preferir cortar claim a inventar. Nunca fabricar DOI.
- Incluir tabela "Registrado / off-label / manipulado / não prescrever" quando houver terapêutica.
- Incluir fluxograma clínico em markdown (passos numerados) aplicável ao Brasil.
- Incluir checklist de prontuário/TCLE (itens objetivos).
- Separar evidência A/B/C/D explicitamente nas seções de ensaios.
- Tom de professor USP/SBEM: sóbrio, anti-hype, acionável.`;

const FIX_SYSTEM = `Você é editor médico sênior da Doutiva. Recebe uma MONOGRAFIA e um AUDIT crítico.
Reescreva a MONOGRAFIA corrigindo erros factuais/de dose apontados, removendo claims sem suporte, reforçando âncoras [S#] do material-fonte, e ACRESENTANDO obrigatoriamente (se faltarem):
(1) tabela regulatória registrado / off-label / manipulado / não prescrever;
(2) fluxograma de conduta BR em passos numerados;
(3) checklist de prontuário/TCLE;
(4) tabela densa de evidência (ensaio, n, desfecho, magnitude) quando houver farmacoterapia.
Regras inegociáveis:
- NÃO encurtar: a saída deve ter NO MÍNIMO o mesmo número de palavras da monografia original (idealmente 5–15% mais longa).
- Não invente estudos/DOIs/números; se incerto use "(verificar)".
- Preserve seções clínicas úteis; edite com precisão cirúrgica.
Responda APENAS com a monografia corrigida em markdown.`;

/**
 * Raise-bar pipeline: deeper generation + independent audit + mandatory fix rewrite + restructure.
 */
export async function raiseBarLesson(input: {
  topic: string;
  courseTitle: string;
  moduleTitle: string;
  sources: string;
  notes: string;
  existingMonograph?: string;
}): Promise<GeneratedLesson> {
  requireAiApiKey();
  const openai = createGatewayOpenAI();
  const useClaude = hasAnthropicDirect();
  const anthropic = useClaude ? createGatewayAnthropic() : null;
  const direct = usesOpenAIDirect();
  const notes = `${RAISE_BAR_NOTES}\n\n${input.notes || ""}`;
  const treatiseModel = useClaude
    ? anthropic!(doutivaClaudeTreatiseModel())
    : direct
      ? openai("gpt-4.1")
      : createGatewayAnthropic()("anthropic/claude-opus-5-5");
  const auditModel = useClaude
    ? anthropic!(doutivaClaudeAuditModel())
    : direct
      ? openai("gpt-4.1-mini")
      : createGatewayAnthropic()("anthropic/claude-sonnet-5");

  try {
    let monograph = (input.existingMonograph || "").trim();

    if (monograph.length < 3000) {
      const base = await generateLesson({ ...input, notes });
      monograph = base.monograph;
      const fix = streamText({
        model: treatiseModel,
        system: FIX_SYSTEM,
        prompt: `Tema: ${input.topic}\n\n=== MATERIAL-FONTE ===\n${input.sources.slice(0, 100000)}\n\n=== AUDIT ===\n${base.audit}\n\n=== MONOGRAFIA ===\n${monograph}`,
        maxOutputTokens: 48000,
        maxRetries: 0,
      });
      monograph = (await fix.text).trim() || monograph;
    } else {
      const auditRun = streamText({
        model: auditModel,
        system: AUDIT_SYSTEM,
        prompt: `Tema: ${input.topic}\n\n=== MONOGRAFIA ===\n${monograph}`,
        maxOutputTokens: 4000,
        maxRetries: 0,
      });
      const audit = (await auditRun.text).trim();
      const fix = streamText({
        model: treatiseModel,
        system: FIX_SYSTEM,
        prompt: `Tema: ${input.topic}\nCurso: ${input.courseTitle}\nMódulo: ${input.moduleTitle}\nNotas:\n${notes}\n\n=== MATERIAL-FONTE ===\n${input.sources.slice(0, 120000)}\n\n=== AUDIT ===\n${audit}\n\n=== MONOGRAFIA ===\n${monograph}`,
        maxOutputTokens: 48000,
        maxRetries: 0,
      });
      monograph = (await fix.text).trim() || monograph;
    }

    if (monograph.length < 2000) throw new Error("Monografia gerada ficou curta demais. Tente de novo.");

    const structured = streamText({
      model: doutivaChatModel(openai),
      system:
        SYSTEM +
        `\n\nRAISE-BAR: devolva a monografia INTEGRALMENTE. Derive 8–12 slides densos (title, table de doses/ensaios, bars ou bullets numéricos, flow, split, pearl), caso clínico nível residência (4 opções plausíveis), quick_ref com tabela de dose/red flags, key_points 5–7, refs preferindo as do material-fonte.`,
      prompt: `Curso: ${input.courseTitle}\nMódulo: ${input.moduleTitle}\nTema: ${input.topic}\nNotas:\n${notes}\n\n=== FONTES ===\n${input.sources.slice(0, 80000)}\n\n=== MONOGRAFIA ===\n${monograph}`,
      output: Output.object({ schema: lessonSchema }),
      providerOptions: doutivaOpenAIProviderOptions("medium"),
    });
    const o = await structured.output;

    const auditFinal = streamText({
      model: auditModel,
      system: AUDIT_SYSTEM,
      prompt: `Tema: ${input.topic}\n\n=== MONOGRAFIA ===\n${monograph}\n\n=== CASO ===\n${JSON.stringify(o.clinical_case)}\n\n=== GUIA ===\n${o.quick_ref}`,
      maxOutputTokens: 4000,
      maxRetries: 0,
    });
    const audit = (await auditFinal.text).trim();

    return {
      title: o.title,
      description: o.description,
      evidence_level: o.evidence_level,
      duration_minutes: Math.max(60, Math.round(o.duration_minutes || 75)),
      key_points: o.key_points,
      refs: o.refs.map((r) => ({ citation: r.citation, url: r.url ?? undefined })),
      slides: o.slides.map(toSlideFromAi).filter((s): s is Slide => !!s),
      monograph,
      quickRef: o.quick_ref,
      clinicalCase: toCase(o.clinical_case) ?? {
        title: "",
        vignette: "",
        data: [],
        question: "",
        options: [],
        teaching: "",
        reward: 0,
      },
      audit,
    };
  } catch (e) {
    friendly(e);
  }
}
