#!/usr/bin/env node
/**
 * Enrich published lessons: replace weak refs + add "Âncoras de evidência" block.
 * Usage:
 *   node --env-file=.env --import tsx scripts/enrich-lesson-evidence.mjs --course=hormonios-implantes-criterio --only=12,14,16
 */
import { createClient } from "@supabase/supabase-js";
import { streamText, Output } from "ai";
import { z } from "zod";
import {
  createGatewayOpenAI,
  doutivaChatModel,
  doutivaOpenAIProviderOptions,
  requireAiApiKey,
} from "../src/lib/ai-provider.server.ts";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const courseArg = (process.argv.find((a) => a.startsWith("--course=")) || "").split("=")[1];
const onlyArg = (process.argv.find((a) => a.startsWith("--only=")) || "").split("=")[1];
const onlyPos = onlyArg
  ? new Set(onlyArg.split(",").map((x) => Number(x.trim())).filter(Boolean))
  : null;

const schema = z.object({
  evidence_level: z.string(),
  anchors_markdown: z.string(),
  refs: z.array(z.object({ citation: z.string(), url: z.string().nullable() })),
  notes: z.string(),
});

const DOMAIN_HINTS = {
  "hormonios-implantes-criterio": `Âncoras esperadas quando couber (só se tiver certeza do nome/ano):
- Bhasin S et al. Endocrine Society Guideline Testosterone Therapy (JCEM 2018)
- WHI / Manson et al. menopausal HT; NAMS/IMS/FEBRASGO posicionamentos
- CFM Resolução 2.333/2023
- EAU male hypogonadism guidelines
NÃO invente DOI. Se incerto, cite guideline pelo nome oficial sem DOI.`,
  "manipulados-injetaveis-criterio": `Âncoras: RDC ANVISA de manipulação estéril (citar número só se certo), CFM 2.217/2018, CFM 2.333/2023,
USP <797> como referência internacional de compounding estéril, literatura de outbreaks em compounding (ex. NECC 2012) sem inventar detalhes.
Incretinas: STEP/SURMOUNT/SELECT pelo nome do trial + autores âncora se souber.`,
  "soroterapia-injetaveis-estereis": `Âncoras: guidelines de fluidoterapia, toxicidade de Mg/K IV, ferro IV (hipersensibilidade),
vitamina C IV (G6PD/oxalato), CFM publicidade, ANVISA manipulação. Sem inventar n de ensaio.`,
  "obesidade-precisao-consultorio": `Âncoras: STEP 1/4 (Wilding, Rubino), SURMOUNT-1 (Jastreboff), SELECT (Lincoff),
diretrizes ABESO/SBEM/ADA Standards of Care. Sem inventar números de resultado — descreva qualitativamente se incerto.`,
  "tirzepatida-incretinas-consultorio": `Âncoras: SURMOUNT, STEP, SELECT, FLOW, SURPASS. Autores âncora: Jastreboff, Wilding, Lincoff, Garvey.`,
};

async function enrichOne(courseTitle, slug, lesson) {
  requireAiApiKey();
  const openai = createGatewayOpenAI();
  const existingRefs = JSON.stringify(lesson.refs || [], null, 2);
  const monoTail = (lesson.monograph || "").slice(-2500);
  const system = `Você é revisor científico da Doutiva. Melhora a base bibliográfica de aulas para MÉDICOS.
Regras:
- NUNCA invente DOI, PMID, volume, páginas ou resultados numéricos de trials.
- Prefira guidelines e trials landmark pelo nome oficial + autores/ano quando tiver certeza.
- Remova ou substitua entradas com "verificar", placeholders ou citações vagas.
- Entregue 8–12 refs sólidas quando o tema permitir; menos se o tema for só regulatório/operacional.
- anchors_markdown: seção curta (800–2000 caracteres) "## Âncoras de evidência" com bullets do que sustenta a conduta e o que é extrapolaçao/D.
${DOMAIN_HINTS[slug] || ""}`;

  const prompt = `Curso: ${courseTitle}
Aula #${lesson.position}: ${lesson.title}
Evidence level atual: ${lesson.evidence_level || "—"}

Refs atuais:
${existingRefs}

Final da monografia (contexto):
${monoTail}

Produza evidence_level revisado, anchors_markdown e refs limpas.`;

  const result = streamText({
    model: doutivaChatModel(openai),
    system,
    prompt,
    output: Output.object({ schema }),
    providerOptions: doutivaOpenAIProviderOptions("high"),
    maxOutputTokens: 6000,
    maxRetries: 1,
  });
  const o = await result.output;
  if (!o?.refs?.length || !o.anchors_markdown) throw new Error("enrich vazio");
  return o;
}

async function main() {
  if (!courseArg) throw new Error("--course=slug required");
  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", courseArg)
    .single();
  if (error) throw error;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, position, title, monograph, refs, evidence_level, status")
    .eq("course_id", course.id)
    .eq("status", "published")
    .order("position");

  for (const lesson of lessons || []) {
    if (onlyPos && !onlyPos.has(lesson.position)) continue;
    console.log(`\n=== enrich ${course.slug}#${lesson.position} ${lesson.title?.slice(0, 50)} ===`);
    try {
      const enriched = await enrichOne(course.title, course.slug, lesson);
      let mono = lesson.monograph || "";
      // strip previous anchors block if re-run
      mono = mono.replace(/\n## Âncoras de evidência[\s\S]*$/m, "").trimEnd();
      mono = `${mono}\n\n${enriched.anchors_markdown.trim()}\n`;
      const { error: uerr } = await supabase
        .from("lessons")
        .update({
          monograph: mono.replace(/\u0000/g, ""),
          refs: enriched.refs,
          evidence_level: enriched.evidence_level || lesson.evidence_level,
          updated_at: new Date().toISOString(),
          reviewed_by: "Conselho editorial Doutiva · revisão de evidência",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", lesson.id);
      if (uerr) throw uerr;
      console.log(
        "ok refs",
        enriched.refs.length,
        "anchors",
        enriched.anchors_markdown.length,
        "notes",
        enriched.notes?.slice(0, 80),
      );
    } catch (e) {
      console.error("FAIL", lesson.position, e?.message || e);
    }
  }
  console.log("\nDONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
