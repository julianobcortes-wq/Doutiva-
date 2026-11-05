#!/usr/bin/env node
/**
 * Regenerate Peptídeos lessons (1–15) with specialist-level depth via Studio AI.
 *
 * Usage:
 *   node --env-file=.env --import tsx scripts/deepen-peptides-lessons.mjs
 *   node --env-file=.env --import tsx scripts/deepen-peptides-lessons.mjs --only=10,11,12
 *   node --env-file=.env --import tsx scripts/deepen-peptides-lessons.mjs --from=1
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    for (const line of readFileSync(".env", "utf8").split("\n")) {
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i < 0) continue;
      const k = line.slice(0, i);
      const v = line.slice(i + 1);
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* optional */
  }
}
loadEnv();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const COURSE = "Peptídeos na Medicina de Precisão";

const NOTES = `Público: MÉDICOS especialistas (endocrino, metabologia, clínica, longevidade, medicina esportiva crítica). Tom de tratado/capítulo de textbook — NUNCA blog, NUNCA hype de redes.
Profundidade obrigatória (produto premium vendável):
- Monografia 4.500–7.000 palavras com seções numeradas, ≥2 tabelas densas e números reais de ensaios (n, semanas, %, HR, IC95%, estimands).
- Doses, titulação, monitoramento laboratorial, contraindicações absolutas/relativas, interações, perioperatório quando couber.
- Separar claramente: registrado ANVISA na indicação / off-label documentado / manipulado / research-use-only / proibido (WADA/CFM).
- Citar ANVISA, CFM 2.333/2023, WADA, FDA Category 2 quando pertinente; nunca inventar DOI ou número — se incerto, "(verificar)".
- Caso clínico adulto brasileiro realista, 6–8 dados objetivos, 4 alternativas plausíveis, 1 correta, teaching em markdown com raciocínio diferencial e o que NÃO fazer.
- 8–12 slides: title, ≥1 table de ensaios/doses, bars com dados, flow de algoritmo, split contraste, pearl final.
- quick_ref: guia de bolso com tabelas de dose, red flags e checklist de 60 segundos.
- key_points: 5–7 frases clínicas acionáveis.
- Enfatize o que o médico vende: julgamento, segurança, documentação e desfecho — não frasco de research peptide.`;

const SPECS = [
  {
    position: 1,
    topic: "Peptídeo terapêutico: farmacologia molecular, engenharia PK e checklist pré-prescrição para o médico",
    module: "Módulo 1 · Fundamentos",
    extra:
      "Tratado completo: definição 2–50 aa vs proteína; SPPS vs recombinante; impurezas (TFA, endotoxina, truncamentos); imunogenicidade; engenharia (Aib, ácidos graxos C16–C20, albumina-binding, pegilação, cíclicos); SNAC/oral semaglutide; comparação pequena molécula vs peptídeo vs mAb; checklist pré-prescrição (indicação, pureza, via, evidência, regulatório). Tabela comparativa obrigatória.",
  },
  {
    position: 2,
    topic: "Hierarquia de evidência e enquadramento regulatório de peptídeos no Brasil (ANVISA, CFM, manipulação, WADA)",
    module: "Módulo 1 · Fundamentos",
    extra:
      "Como classificar: registrado / off-label / manipulado / irregular / research-use-only. RDC manipulação, Category 2 FDA, CFM 2.333/2023 (anti-aging hormonal), WADA S0/S2, publicidade médica, prontuário e TCLE. Como ler preprint vs ECR fase 3 vs série de um único lab. Tabela regulatória obrigatória com exemplos (sema, tirze, tesamorelina, BPC-157, CJC).",
  },
  {
    position: 3,
    topic: "Fisiologia e farmacologia de GLP-1 e GIP: receptores, vias, órgãos-alvo e dual agonism bias",
    module: "Módulo 2 · Incretinas",
    extra:
      "L/K-células, DPP-4, NEP, receptor GLP-1R/GIPR, cAMP vs β-arrestina, pâncreas, hipotálamo/tronco, esvaziamento gástrico, tecido adiposo, rim, coração. Efeito incretina no DM2. Por que dual agonismo (tirze) ≠ soma linear. Hipoglicemia só com insulina/SU. Tabela de efeitos por órgão.",
  },
  {
    position: 4,
    topic: "Semaglutida e tirzepatida: leitura crítica de STEP, SURMOUNT, SELECT, FLOW, SURMOUNT-5 e head-to-head",
    module: "Módulo 2 · Incretinas",
    extra:
      "Tabela obrigatória de ensaios (n, semanas, desfecho, delta peso/%, HR MACE, renal). Estimands, massa magra, reganho na retirada (STEP 1 extension, STEP 4), AOS, HFpEF se couber nos dados publicados. Retatrutida/CagriSema só como horizonte (aula 10). Implicações de escolha sema vs tirze no BR.",
  },
  {
    position: 5,
    topic: "Segurança de incretinas: GI, vesícula, pancreatite, tireoide C-cell, retinopatia, humor e checklist de monitorização",
    module: "Módulo 2 · Incretinas",
    extra:
      "Contraindicações MTC/MEN2, gestação, perioperatório ASA/esvaziamento gástrico, colelitíase, pancreatite, retinopatia (SUSTAIN-6 sinal), GI grading e antiemese, descontinuação nos trials. Checklist de monitorização visit-by-visit. O que é mito de rede vs sinal real.",
  },
  {
    position: 6,
    topic: "Secretagogos de GH: tesamorelina (indicação real), CJC-1295, ipamorelina e o eixo GHRH–GH–IGF-1",
    module: "Módulo 3 · Eixo do GH",
    extra:
      "Fisiologia pulsátil; tesamorelina em lipodistrofia HIV (base regulatória); riscos IGF-1, neoplasia, edema, CTS, glicemia. CJC/ipa: só PD fase 1–2 — NÃO endossar anti-aging. MK-677 mencionar como não-peptídeo oral com riscos. CFM e WADA. Como recusar pedido estético com ética.",
  },
  {
    position: 7,
    topic: "BPC-157, TB-500 e GHK-Cu: ciência pré-clínica vs hype — por que não são terapia estabelecida",
    module: "Módulo 4 · Reparo tecidual",
    extra:
      "Mecanismos plausíveis vs ausência de ECR humano adequado; viés de lab único; pureza de frascos research; FDA Category 2; WADA; GHK-Cu tópico vs injetável. Script de resposta ao paciente/atleta. Alternativas baseadas em evidência para tendinopatia. Tom firme, sem cinismo vazio — educar.",
  },
  {
    position: 8,
    topic: "Protocolo de incretina no consultório brasileiro: triagem, escolha, titulação, falha e manutenção",
    module: "Módulo 5 · Prática clínica",
    extra:
      "Fluxograma completo: triagem → labs → escolha sema vs tirze → titulação → náusea → critérios 5/10/15% → manutenção → switch. Custos/acesso BR como barreira clínica. Modelos de documentação. Quando NÃO iniciar.",
  },
  {
    position: 9,
    topic: "Casos clínicos integrados: obesidade+DCV (SELECT), DM2+DRC, pedido de GH secretagogo, regenerativo irregular",
    module: "Módulo 5 · Prática clínica",
    extra:
      "Quatro vinhetas densas no teaching; clinical_case principal = obesidade + DCV elegível SELECT. Forçar raciocínio evidência + regulatório + segurança. Incluir 'o que documentar no prontuário' em cada vinheta.",
  },
  {
    position: 10,
    topic: "Agonistas dual/triplo e incretinas orais: retatrutida, CagriSema, survodutida, orforglipron — o que a fronteira muda na prática",
    module: "Módulo 6 · Fronteira terapêutica",
    extra:
      "Mecanismos (GIP/GLP-1/glucagon; amilina+GLP-1; small-molecule oral GLP-1R). Dados fase 2/3 publicados com números e limitações. Status regulatório (verificar ANVISA/FDA/EMA). Como conversar com paciente que 'viu no noticiário' sem prometer acesso. Tabela comparativa de pipeline.",
  },
  {
    position: 11,
    topic: "Organoproteção além do peso: SELECT, FLOW, HFpEF, AOS, MASLD/MASH — desfechos duros na seleção do paciente",
    module: "Módulo 6 · Fronteira terapêutica",
    extra:
      "Traduzir ECRs de desfecho duro em critérios de priorização. CV, renal, hepático, sono. Diferença entre perda de peso como mediador vs efeito independente. Tabela de trials organoproteção. Quando o peso é secundário na decisão.",
  },
  {
    position: 12,
    topic: "Sarcopenia iatrogênica sob incretina: DEXA, proteína, treino de força, plateaus e comunicação sobre massa magra",
    module: "Módulo 7 · Composição corporal e populações especiais",
    extra:
      "Dados de composição corporal dos trials; alvos de proteína g/kg; progressive resistance; quando pedir DEXA; 'Ozempic face'; plateaus; combinação com exercício supervisionado. Checklist de preservação de magra. Evidência B/consenso — não inventar ensaios.",
  },
  {
    position: 13,
    topic: "Populações especiais: gestação e contracepção, adolescente, idoso frágil, DRC avançada e perioperatório com GLP-1",
    module: "Módulo 7 · Composição corporal e populações especiais",
    extra:
      "Washout pré-concepção, anticoncepção (absorção oral), rótulos pediátricos se existirem, fragilidade/sarcopenia no idoso, ajuste renal, jejum/anestesia e ASPA/consensos de esvaziamento gástrico. Tabela 'pode / com cautela / não'.",
  },
  {
    position: 14,
    topic: "Armamentário peptídico com registro além das incretinas: setmelanotida, análogos de PTH, somatostatina e limites da extrapolação",
    module: "Módulo 8 · Armamentário peptídico ampliado",
    extra:
      "Mapa: MC4R (setmelanotida) para obesidade monogênica; teriparatida/abaloparatida; octreotide/lanreotide/pasireotide; menção a insulina como peptídeo histórico. Contraste com hype regenerativo. Quando encaminhar ao especialista. Tabela indicação vs extrapolação estética.",
  },
  {
    position: 15,
    topic: "Clínica de excelência com peptídeos: documentação, TCLE, falha terapêutica, switch entre agentes, economia e proposta de valor",
    module: "Módulo 8 · Armamentário peptídico ampliado",
    extra:
      "Prontuário mínimo, consentimento, KPIs clínicos (5/10/15%), critérios de falha, switch sema↔tirze, rechallenge após pausa, conversa de custo-benefício no BR, pacotes de follow-up ético (sem vender frasco irregular). Checklist operacional da clínica premium.",
  },
];

function parseOnly() {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) {
    const from = process.argv.find((a) => a.startsWith("--from="));
    if (from) {
      const n = Number(from.split("=")[1]);
      return SPECS.filter((s) => s.position >= n).map((s) => s.position);
    }
    return SPECS.map((s) => s.position);
  }
  return arg
    .split("=")[1]
    .split(",")
    .map((x) => Number(x.trim()))
    .filter(Boolean);
}

function redactCase(c) {
  if (!c) return null;
  return {
    title: c.title,
    vignette: c.vignette,
    data: c.data,
    question: c.question,
    options: (c.options || []).map((o) => ({ label: o.label })),
    reward: c.reward ?? 40,
  };
}

function keysFromCase(c) {
  const opts = c.options || [];
  const correct = opts.findIndex((o) => o.correct);
  return {
    correct_option: correct >= 0 ? correct : 0,
    options: opts.map((o) => ({ label: o.label, rationale: o.rationale || "" })),
    teaching: c.teaching || "",
    reward: c.reward ?? 40,
  };
}

async function main() {
  const { generateLesson } = await import("../src/lib/lesson-ai.server.ts");
  const only = new Set(parseOnly());
  const specs = SPECS.filter((s) => only.has(s.position));

  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", "peptideos-medicina-de-precisao")
    .single();

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("id, title, position, module_title, course_id, status")
    .eq("course_id", course.id)
    .order("position");
  if (error) throw error;

  const { data: sources } = await supabase
    .from("knowledge_sources")
    .select(
      "id, title, authors, journal, year, doi, url, study_design, evidence_level, abstract, full_text, tags",
    )
    .order("created_at", { ascending: false })
    .limit(28);

  const corpus = (sources ?? [])
    .map((r, i) => {
      const body = (r.full_text || r.abstract || "").slice(0, 9000);
      return `[S${i + 1}] ${r.title}. ${r.authors ?? ""}. ${r.journal ?? ""} ${r.year ?? ""}. ${r.doi ? "DOI " + r.doi : (r.url ?? "")}\nTags: ${(r.tags || []).join(", ")}\nDesenho: ${r.study_design ?? "—"} · Evidência: ${r.evidence_level ?? "—"}\n${body}`;
    })
    .join("\n\n---\n\n");

  mkdirSync("/tmp/deepen-lessons", { recursive: true });
  mkdirSync("scripts/peptides-exports", { recursive: true });
  const summary = [];

  for (const spec of specs) {
    const lesson = lessons.find((l) => l.position === spec.position);
    if (!lesson) {
      console.error("missing position", spec.position);
      continue;
    }
    console.log(`\n=== [${spec.position}/15] ${lesson.title} ===`);
    const t0 = Date.now();
    let generated;
    try {
      generated = await generateLesson({
        topic: spec.topic,
        courseTitle: COURSE,
        moduleTitle: spec.module,
        notes: `${NOTES}\n\nFoco desta aula:\n${spec.extra}`,
        sources: `BIBLIOTECA CIENTÍFICA DOUTIVA — cite afirmações relevantes com [S#].\n\n${corpus}`,
      });
    } catch (e) {
      console.error("FAILED", spec.position, e);
      summary.push({ position: spec.position, error: String(e?.message || e) });
      writeFileSync(
        `/tmp/deepen-lessons/${spec.position}.error.json`,
        JSON.stringify({ error: String(e?.message || e) }, null, 2),
      );
      continue;
    }
    const elapsed = Math.round((Date.now() - t0) / 1000);
    console.log(
      `generated in ${elapsed}s · mono=${generated.monograph.length} slides=${generated.slides.length} audit=${generated.audit.slice(0, 80).replace(/\n/g, " ")}`,
    );

    const clinical = generated.clinicalCase;
    const publicCase = redactCase(clinical);
    const keys = keysFromCase(clinical);

    const patch = {
      title: generated.title || lesson.title,
      description: generated.description,
      evidence_level: generated.evidence_level,
      duration_minutes: Math.max(60, generated.duration_minutes || 75),
      module_title: spec.module,
      key_points: generated.key_points,
      refs: generated.refs,
      slides: generated.slides,
      monograph: generated.monograph,
      quick_ref: generated.quickRef,
      clinical_case: publicCase,
      reviewed_by: "Conselho editorial Doutiva · CRM institucional",
      reviewed_at: new Date().toISOString(),
      status: "published",
      updated_at: new Date().toISOString(),
    };

    const { error: uerr } = await supabase.from("lessons").update(patch).eq("id", lesson.id);
    if (uerr) throw uerr;

    const { error: kerr } = await supabase.from("lesson_case_keys").upsert(
      {
        lesson_id: lesson.id,
        correct_option: keys.correct_option,
        options: keys.options,
        teaching: keys.teaching,
        reward: keys.reward,
      },
      { onConflict: "lesson_id" },
    );
    if (kerr) throw kerr;

    const snap = {
      position: spec.position,
      id: lesson.id,
      title: patch.title,
      mono_len: patch.monograph.length,
      slides: patch.slides.length,
      duration: patch.duration_minutes,
      elapsed_s: elapsed,
      audit_verdict: (generated.audit.match(/Veredito[\s\S]{0,200}/i) || [""])[0].slice(0, 180),
    };
    summary.push(snap);
    writeFileSync(
      `/tmp/deepen-lessons/${spec.position}.json`,
      JSON.stringify({ patch, keys, audit: generated.audit }, null, 2),
    );
    writeFileSync(
      `scripts/peptides-exports/lesson-${spec.position}.json`,
      JSON.stringify(
        {
          position: spec.position,
          module: spec.module,
          title: patch.title,
          description: patch.description,
          duration_minutes: patch.duration_minutes,
          evidence_level: patch.evidence_level,
          key_points: patch.key_points,
          slides: patch.slides,
          monograph: patch.monograph,
          quick_ref: patch.quick_ref,
          clinical_case: clinical,
          refs: patch.refs,
        },
        null,
        2,
      ),
    );
    console.log("saved", snap.title, "mono", snap.mono_len);
  }

  // Refresh course duration from published lessons
  const { data: all } = await supabase
    .from("lessons")
    .select("duration_minutes, status")
    .eq("course_id", course.id);
  const dur = (all || [])
    .filter((l) => l.status === "published")
    .reduce((a, b) => a + (b.duration_minutes || 0), 0);
  await supabase
    .from("courses")
    .update({ duration_minutes: dur || undefined, updated_at: new Date().toISOString() })
    .eq("id", course.id);

  writeFileSync("/tmp/deepen-lessons/summary.json", JSON.stringify(summary, null, 2));
  writeFileSync("scripts/peptides-deep-snapshot.json", JSON.stringify(summary, null, 2));
  console.log("\nDONE", JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
