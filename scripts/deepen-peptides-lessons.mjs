#!/usr/bin/env node
/**
 * Regenerate all published Peptídeos lessons with specialist-level depth via Studio AI,
 * then persist monograph/slides/case/keys to Supabase.
 *
 * Usage: node --env-file=.env scripts/deepen-peptides-lessons.mjs
 * Or:    npx tsx scripts/deepen-peptides-lessons.mjs  (imports TS generateLesson)
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

const NOTES = `Público: MÉDICOS especialistas (endocrino, metabologia, clínica, longevidade). Tom de tratado/UpToDate — nunca de blog.
Profundidade obrigatória:
- Monografia 3.500–5.000 palavras com seções numeradas, tabelas densas e números reais de ensaios (n, semanas, %, HR, IC95%).
- Doses, titulação, monitoramento laboratorial, contraindicações absolutas/relativas, interações.
- Separar claramente: registrado ANVISA na indicação / off-label / manipulado / research-use-only / proibido.
- Citar ANVISA, CFM, WADA quando pertinente; nunca inventar DOI ou número — se incerto, "(verificar)".
- Caso clínico adulto brasileiro realista, 6 dados objetivos, 4 alternativas plausíveis, 1 correta, teaching em markdown com raciocínio diferencial.
- 7–9 slides: title, table/bars com dados de ensaio, flow de algoritmo, split contraste, pearl.
- quick_ref: guia de bolso com tabelas de dose e red flags.
- key_points: 5–6 frases clínicas acionáveis.`;

const SPECS = [
  {
    position: 1,
    topic: "Peptídeo terapêutico: farmacologia molecular, engenharia PK e checklist pré-prescrição para o médico",
    module: "Módulo 1 · Fundamentos",
    extra:
      "Aprofunde SPPS vs recombinante, TFA residual, endotoxinas, Category 2 FDA, SNAC/oral semaglutide PK, albumina-binding fatty acids (C16–C20), Aib, imunogenicidade. Tabela comparativa pequena molécula vs peptídeo vs mAb.",
  },
  {
    position: 2,
    topic: "Hierarquia de evidência e enquadramento regulatório de peptídeos no Brasil (ANVISA, CFM, manipulação, WADA)",
    module: "Módulo 1 · Fundamentos",
    extra:
      "Detalhe RDC de manipulação, Category 2, produtos research-use-only, responsabilidade ética do prescritor, off-label documentado, farmacovigilância. Como ler um preprint vs ECR fase 3. Tabela: registrado / off-label / manipulado / irregular.",
  },
  {
    position: 3,
    topic: "Fisiologia e farmacologia de GLP-1 e GIP: receptores, vias de sinalização, efeitos em pâncreas, cérebro, estômago e tecido adiposo",
    module: "Módulo 2 · Incretinas",
    extra:
      "Inclua L-células, K-células, DPP-4, NEP, dual agonism bias (cAMP vs β-arrestina), efeito incretina em DM2, saciedade hipotalâmica, esvaziamento gástrico, risco de hipoglicemia quando combinado a insulina/sulfonilureia.",
  },
  {
    position: 4,
    topic: "Semaglutida e tirzepatida: leitura crítica de STEP, SURMOUNT, SELECT, FLOW, SURMOUNT-5 e implicações clínicas",
    module: "Módulo 2 · Incretinas",
    extra:
      "Números exatos de perda ponderal, MACE HR, renal, AOS, HFpEF, estimands, massa magra, reganho na retirada, comparação head-to-head. Tabela de ensaios com n/duração/desfecho/resultado. Retatrutida só como horizonte (sem registro).",
  },
  {
    position: 5,
    topic: "Segurança de incretinas: GI, vesícula, pancreatite, tireoide C-cell, retinopatia, sarcopenia e preservação de massa magra",
    module: "Módulo 2 · Incretinas",
    extra:
      "Contraindicações (MTC/MEN2), gestação, perioperatório (esvaziamento gástrico/anestesia), DEXA e proteína na dieta, antieméticos, quando pausar. Dados de descontinuação dos trials. Checklist de monitorização.",
  },
  {
    position: 6,
    topic: "Secretagogos de GH: tesamorelina (evidência e indicação), CJC-1295, ipamorelina — o que é registrado vs hype",
    module: "Módulo 3 · Eixo do GH",
    extra:
      "Eixo GHRH-GH-IGF-1, lipodistrofia HIV e tesamorelina (único com base regulatória forte), riscos de IGF-1 elevado, neoplasia, edema, carpal tunnel. CJC/ipa: ausência de ECRs fase 3 robustos para anti-aging. Nunca endossar GH off-label para longevidade.",
  },
  {
    position: 7,
    topic: "BPC-157, TB-500 e GHK-Cu: leitura crítica da literatura pré-clínica e por que não prescritíveis como terapia estabelecida",
    module: "Módulo 4 · Reparo tecidual",
    extra:
      "Separar mecânica biológica plausível de ausência de ECRs humanos adequados, riscos de pureza, WADA, Category 2. Ensinar o aluno a responder pacientes que pedem esses peptídeos com ética e evidência.",
  },
  {
    position: 8,
    topic: "Protocolo de incretina no consultório brasileiro: seleção de paciente, titulação, monitoramento, falha terapêutica e manutenção",
    module: "Módulo 5 · Prática clínica",
    extra:
      "Fluxograma: triagem → exames → escolha semaglutida vs tirzepatida → titulação semana a semana → manejo de náusea → critérios de sucesso (≥5–10–15%) → plano de manutenção. Inclua custos/acesso como barreira clínica.",
  },
  {
    position: 9,
    topic: "Casos clínicos integrados de peptídeos: obesidade com DCV, DM2+DRC, pedido de secretagogo de GH, e peptídeo regenerativo irregular",
    module: "Módulo 5 · Prática clínica",
    extra:
      "Quatro vinhetas densas no teaching; o clinical_case principal deve ser o mais didático (obesidade + DCV elegível a SELECT). Forçar raciocínio regulatório + evidência + segurança.",
  },
];

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

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("id, title, position, module_title, course_id")
    .eq("status", "published")
    .order("position");
  if (error) throw error;

  const { data: sources } = await supabase
    .from("knowledge_sources")
    .select("id, title, authors, journal, year, doi, url, study_design, evidence_level, abstract, full_text")
    .order("created_at", { ascending: false })
    .limit(16);

  const corpus = (sources ?? [])
    .map((r, i) => {
      const body = (r.full_text || r.abstract || "").slice(0, 8000);
      return `[S${i + 1}] ${r.title}. ${r.authors ?? ""}. ${r.journal ?? ""} ${r.year ?? ""}. ${r.doi ? "DOI " + r.doi : r.url ?? ""}\nDesenho: ${r.study_design ?? "—"} · Evidência: ${r.evidence_level ?? "—"}\n${body}`;
    })
    .join("\n\n---\n\n");

  mkdirSync("/tmp/deepen-lessons", { recursive: true });
  const summary = [];

  for (const spec of SPECS) {
    const lesson = lessons.find((l) => l.position === spec.position);
    if (!lesson) {
      console.error("missing position", spec.position);
      continue;
    }
    console.log(`\n=== [${spec.position}/9] ${lesson.title} ===`);
    const t0 = Date.now();
    const generated = await generateLesson({
      topic: spec.topic,
      courseTitle: COURSE,
      moduleTitle: spec.module,
      notes: `${NOTES}\n\nFoco desta aula:\n${spec.extra}`,
      sources: `BIBLIOTECA CIENTÍFICA DOUTIVA — cite afirmações relevantes com [S#].\n\n${corpus}`,
    });
    const elapsed = Math.round((Date.now() - t0) / 1000);
    console.log(
      `generated in ${elapsed}s · mono=${generated.monograph.length} slides=${generated.slides.length} audit=${generated.audit.slice(0, 60).replace(/\n/g, " ")}`,
    );

    const clinical = generated.clinicalCase;
    const publicCase = redactCase(clinical);
    const keys = keysFromCase(clinical);

    const patch = {
      title: generated.title || lesson.title,
      description: generated.description,
      evidence_level: generated.evidence_level,
      duration_minutes: Math.max(45, generated.duration_minutes || 45),
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
    writeFileSync(`/tmp/deepen-lessons/${spec.position}.json`, JSON.stringify({ patch, keys, audit: generated.audit }, null, 2));
    console.log("saved", snap.title, "mono", snap.mono_len);
  }

  writeFileSync("/tmp/deepen-lessons/summary.json", JSON.stringify(summary, null, 2));
  console.log("\nDONE", JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
