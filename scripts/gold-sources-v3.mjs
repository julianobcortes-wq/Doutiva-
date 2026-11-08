/**
 * Gold-standard source packs for Doutiva raise-bar (RAG anchors).
 * Curated citations with abstracts/syntheses — upserted into knowledge_sources.
 */
export const GOLD_PACKS = {
  "tirzepatida-incretinas-consultorio": [
    {
      external_id: "gold-surmount-1",
      title: "Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1).",
      authors: "Jastreboff AM, et al.",
      journal: "N Engl J Med",
      year: 2022,
      doi: "10.1056/NEJMoa2206038",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206038",
      study_design: "Phase 3 RCT",
      evidence_level: "A",
      tags: ["ouro", "tirzepatida", "incretinas", "obesidade"],
      abstract:
        "Adults with obesity: tirzepatide 5/10/15 mg vs placebo; substantial placebo-adjusted weight loss; GI AEs dose-related; titrate from 2.5 mg qW.",
      full_text: `# SURMOUNT-1 (síntese Doutiva)
- População: adultos com obesidade/sobrepeso + comorbidade, sem DM2.
- Desfecho: perda ponderal vs placebo em ~72 semanas.
- Mensagem clínica: tirzepatida produz perda de peso dose-dependente; náusea/vômito/diarréia são os AE principais; iniciar 2,5 mg e titular.
- Implicação BR: confirmar indicação/registro local; documentar metas 5/10/15%.`,
    },
    {
      external_id: "gold-surmount-2",
      title: "Tirzepatide for Obesity and Type 2 Diabetes (SURMOUNT-2).",
      authors: "Garvey WT, et al.",
      journal: "Lancet",
      year: 2023,
      doi: "10.1016/S0140-6736(23)01200-X",
      url: "https://doi.org/10.1016/S0140-6736(23)01200-X",
      study_design: "Phase 3 RCT",
      evidence_level: "A",
      tags: ["ouro", "tirzepatida", "DM2", "obesidade"],
      abstract: "Tirzepatide in obesity with T2D: weight and glycemic benefit; hypoglycemia mainly with insulin/SU.",
      full_text: `# SURMOUNT-2
- Tirzepatida em obesidade + DM2: benefício glicêmico e ponderal.
- Monitorar hipoglicemia se insulina/sulfonilureia.
- Titulação lenta se GI intenso.`,
    },
    {
      external_id: "gold-select",
      title: "Semaglutide and Cardiovascular Outcomes in Obesity without Diabetes (SELECT).",
      authors: "Lincoff AM, et al.",
      journal: "N Engl J Med",
      year: 2023,
      doi: "10.1056/NEJMoa2307563",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2307563",
      study_design: "Phase 3 CVOT",
      evidence_level: "A",
      tags: ["ouro", "semaglutida", "SELECT", "DCV"],
      abstract: "Semaglutide 2.4 mg reduced MACE in adults with overweight/obesity and CVD without diabetes.",
      full_text: `# SELECT
- Semaglutida 2,4 mg SC semanal vs placebo.
- População: ≥45a, IMC≥27, DCV estabelecida, sem DM.
- Desfecho: redução de MACE.
- Conduta: priorizar perfil SELECT-like mesmo quando a balança não é o único objetivo.`,
    },
    {
      external_id: "gold-step1",
      title: "Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1).",
      authors: "Wilding JPH, et al.",
      journal: "N Engl J Med",
      year: 2021,
      doi: "10.1056/NEJMoa2032183",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
      study_design: "Phase 3 RCT",
      evidence_level: "A",
      tags: ["ouro", "semaglutida", "STEP", "obesidade"],
      abstract: "Semaglutide 2.4 mg produced clinically meaningful weight loss vs placebo with lifestyle.",
      full_text: `# STEP 1
- Semaglutida 2,4 mg; perda ponderal robusta; AE GI; reganho esperado se cessar sem plano de manutenção.`,
    },
    {
      external_id: "gold-flow",
      title: "Semaglutide and Renal Outcomes in Type 2 Diabetes (FLOW).",
      authors: "Perkovic V, et al.",
      journal: "N Engl J Med",
      year: 2024,
      doi: "10.1056/NEJMoa2403347",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2403347",
      study_design: "Phase 3 renal outcomes",
      evidence_level: "A",
      tags: ["ouro", "semaglutida", "FLOW", "DRC"],
      abstract: "Semaglutide reduced kidney disease events and CV death in T2D with CKD.",
      full_text: `# FLOW
- Benefício renal/CV em DM2 + DRC.
- Implicação: fenótipo renal prioriza semaglutida quando alinhado ao rótulo local.`,
    },
    {
      external_id: "gold-surmount5",
      title: "Tirzepatide vs Semaglutide for Obesity (SURMOUNT-5 head-to-head).",
      authors: "Aronne LJ, et al.",
      journal: "N Engl J Med",
      year: 2025,
      doi: "10.1056/NEJMoa2416392",
      url: "https://doi.org/10.1056/NEJMoa2416392",
      study_design: "Phase 3b RCT head-to-head",
      evidence_level: "A",
      tags: ["ouro", "tirzepatida", "semaglutida", "head-to-head"],
      abstract: "Head-to-head obesity trial comparing tirzepatide and semaglutide; verify local availability and labeled doses.",
      full_text: `# SURMOUNT-5 (síntese)
- Comparação direta: usar para escolha quando meta ponderal é prioritária.
- Sempre confirmar doses rotuladas e acesso BR; não extrapolar manipulado = produto industrial.`,
    },
    {
      external_id: "gold-perioperative-glp1",
      title: "GLP-1 receptor agonists and perioperative aspiration risk — consensus considerations.",
      authors: "ASPA / multisociety statements (síntese Doutiva)",
      journal: "Practice consensus",
      year: 2023,
      doi: null,
      url: null,
      study_design: "Consensus",
      evidence_level: "B",
      tags: ["ouro", "incretinas", "perioperatório", "segurança"],
      abstract: "Delayed gastric emptying raises perioperative aspiration concerns; individualized hold strategies.",
      full_text: `# Perioperatório e GLP-1
- Esvaziamento gástrico retardado → risco de aspiração.
- Conduta: comunicar anestesia; individualizar pausa; líquidos claros / ultrassom gástrico quando disponível.
- Não inventar regra única universal — documentar decisão.`,
    },
    {
      external_id: "gold-cfm-2333",
      title: "CFM Resolução 2.333/2023 — terapias hormonais com finalidade estética/anti-aging.",
      authors: "Conselho Federal de Medicina",
      journal: "Norma ética BR",
      year: 2023,
      doi: null,
      url: "https://portal.cfm.org.br/",
      study_design: "Regulation",
      evidence_level: "A",
      tags: ["ouro", "CFM", "regulatório", "ética"],
      abstract: "Veda hormonioterapia com finalidade estética, de performance ou anti-aging sem indicação clínica.",
      full_text: `# CFM 2.333/2023
- Não prescrever hormônios/peptídeos para estética, massa muscular ou anti-aging sem indicação.
- Documentar indicação clínica real.
- Aplica-se ao discurso comercial em torno de incretinas/hormônios.`,
    },
  ],

  "hormonios-implantes-criterio": [
    {
      external_id: "gold-es-hypogonadism",
      title: "Testosterone Therapy in Men With Hypogonadism: Endocrine Society Clinical Practice Guideline.",
      authors: "Bhasin S, et al.",
      journal: "J Clin Endocrinol Metab",
      year: 2018,
      doi: "10.1210/jc.2018-00229",
      url: "https://doi.org/10.1210/jc.2018-00229",
      study_design: "Practice guideline",
      evidence_level: "A",
      tags: ["ouro", "testosterona", "hipogonadismo", "diretriz"],
      abstract: "Diagnose hypogonadism with symptoms + repeated morning total T; treat only confirmed deficiency; monitor Hct/PSA.",
      full_text: `# Endocrine Society — Hipogonadismo
- Diagnóstico: sintomas + testosterona total matinal baixa em ≥2 ocasiões; considerar SHBG/free T.
- Não tratar apenas por número limítrofe assintomático.
- Monitorar hematócrito, PSA (conforme idade), sintomas, fertilidade.
- Vias: gel, injetável, outros — escolher por segurança/adesão; implante é exceção documentada.`,
    },
    {
      external_id: "gold-traverse",
      title: "Cardiovascular Safety of Testosterone-Replacement Therapy (TRAVERSE).",
      authors: "Lincoff AM, et al.",
      journal: "N Engl J Med",
      year: 2023,
      doi: "10.1056/NEJMoa2215025",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2215025",
      study_design: "Phase 4 CVOT",
      evidence_level: "A",
      tags: ["ouro", "testosterona", "TRAVERSE", "CV"],
      abstract: "TRT in men with hypogonadism and CV disease/risk was noninferior to placebo for MACE; monitor hematocrit/AF signals.",
      full_text: `# TRAVERSE
- Segurança CV: não inferioridade para MACE em população selecionada.
- Vigilância: hematócrito, FA, PA.
- Não autoriza TRT cosmético.`,
    },
    {
      external_id: "gold-thm-nms",
      title: "The 2022 Hormone Therapy Position Statement of The North American Menopause Society.",
      authors: "NAMS",
      journal: "Menopause",
      year: 2022,
      doi: "10.1097/GME.0000000000002028",
      url: "https://doi.org/10.1097/GME.0000000000002028",
      study_design: "Position statement",
      evidence_level: "A",
      tags: ["ouro", "menopausa", "THM", "NAMS"],
      abstract: "HT most favorable near menopause for vasomotor symptoms; individualized risk (breast, VTE); prefer transdermal in higher VTE risk.",
      full_text: `# NAMS 2022
- Janela de oportunidade: início perto da menopausa.
- Sintomas vasomotores: melhor indicação.
- Individualizar mama/trombo; transdérmico se risco VTE.
- Bioidêntico manipulado não é automaticamente mais seguro.`,
    },
    {
      external_id: "gold-whi",
      title: "Risks and Benefits of Estrogen Plus Progestin in Healthy Postmenopausal Women (WHI).",
      authors: "Rossouw JE, et al.",
      journal: "JAMA",
      year: 2002,
      doi: "10.1001/jama.288.3.321",
      url: "https://doi.org/10.1001/jama.288.3.321",
      study_design: "Phase 3 RCT",
      evidence_level: "A",
      tags: ["ouro", "WHI", "THM"],
      abstract: "Landmark WHI: risks/benefits of CEE+MPA; interpret with age/timing hypotheses in later analyses.",
      full_text: `# WHI
- Base histórica de risco CV/mama com terapia oral combinada em população mais velha.
- Não extrapolar cegamente para estradiol transdérmico em mulher recém-menopausada sintomática.`,
    },
    {
      external_id: "gold-bioidentical-statement",
      title: "Compounded bioidentical hormone therapy — Endocrine Society / ACOG caution.",
      authors: "Endocrine Society & ACOG (síntese Doutiva)",
      journal: "Position statements",
      year: 2016,
      doi: null,
      url: null,
      study_design: "Position statement",
      evidence_level: "A",
      tags: ["ouro", "bioidêntico", "manipulação", "segurança"],
      abstract: "Compounded bioidentical HT lacks adequate evidence of superiority/safety vs approved products; prefer approved formulations.",
      full_text: `# Bioidênticos manipulados
- Sem evidência de superioridade vs produtos registrados.
- Variabilidade de dose/pureza.
- Usar só se falha/intolerância a opções registradas + documentação + monitorização.`,
    },
    {
      external_id: "gold-cfm-2333-h",
      title: "CFM Resolução 2.333/2023 — restrição a hormonioterapia estética/anti-aging.",
      authors: "CFM",
      journal: "Norma ética BR",
      year: 2023,
      doi: null,
      url: "https://portal.cfm.org.br/",
      study_design: "Regulation",
      evidence_level: "A",
      tags: ["ouro", "CFM", "hormônios"],
      abstract: "Proíbe uso hormonal com finalidade estética/performance/anti-aging sem indicação.",
      full_text: `# CFM 2.333/2023 (hormônios)
- TRT/THM apenas com deficiência/indicação clínica.
- GH/secretagogos para longevidade: não.`,
    },
  ],

  "soroterapia-injetaveis-estereis": [
    {
      external_id: "gold-usp797",
      title: "USP <797> Pharmaceutical Compounding — Sterile Preparations (overview for clinicians).",
      authors: "United States Pharmacopeia (síntese Doutiva)",
      journal: "USP",
      year: 2023,
      doi: null,
      url: "https://www.usp.org/",
      study_design: "Quality standard",
      evidence_level: "A",
      tags: ["ouro", "esterilidade", "compounding", "USP797"],
      abstract: "Sterile compounding requires controlled environments, beyond-use dating, training, and quality systems.",
      full_text: `# USP <797> (para o prescritor)
- Sala limpa, vestimenta, validação, BUD, treinamento.
- Médico deve exigir farmácia com sistema da qualidade, laudos e rastreio de lote.
- Drip bar sem padrão ≠ farmácia estéril.`,
    },
    {
      external_id: "gold-necc-outbreak",
      title: "Fungal meningitis outbreak associated with contaminated steroid injections (NECC) — lessons.",
      authors: "CDC / NEJM reports (síntese Doutiva)",
      journal: "Outbreak investigation",
      year: 2013,
      doi: "10.1056/NEJMoa1213978",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1213978",
      study_design: "Outbreak report",
      evidence_level: "A",
      tags: ["ouro", "outbreak", "compounding", "segurança"],
      abstract: "Contaminated compounded injectables caused severe fungal infections — quality failures kill.",
      full_text: `# Lição NECC
- Falha de esterilidade em compounding → mortalidade.
- Prescritor compartilha responsabilidade ao escolher a farmácia.
- Exigir rastreabilidade e qualidade, não preço/marketing.`,
    },
    {
      external_id: "gold-myers-evidence",
      title: "Intravenous nutrient therapy (Myers cocktail) — evidence appraisal.",
      authors: "Síntese Doutiva / revisões clínicas",
      journal: "Critical appraisal",
      year: 2018,
      doi: null,
      url: null,
      study_design: "Evidence appraisal",
      evidence_level: "C",
      tags: ["ouro", "Myers", "soroterapia", "evidência"],
      abstract: "Myers cocktail lacks robust RCTs for wellness indications; IV nutrients reserved for documented deficiency or specific indications.",
      full_text: `# Myers / drips
- Evidência fraca para “detox/energia”.
- IV só com deficiência documentada ou indicação específica (ex.: ferro IV quando oral falha/indicado).
- Consentimento e ambiente de emergência.`,
    },
    {
      external_id: "gold-iron-iv",
      title: "Intravenous iron for iron deficiency — guideline-aligned use.",
      authors: "Síntese Doutiva (consensos hematologia)",
      journal: "Guideline synthesis",
      year: 2021,
      doi: null,
      url: null,
      study_design: "Guideline synthesis",
      evidence_level: "A",
      tags: ["ouro", "ferro IV", "deficiência"],
      abstract: "IV iron when oral not tolerated/ineffective or in selected conditions; monitor hypersensitivity.",
      full_text: `# Ferro IV
- Indicação real: deficiência documentada + falha/intolerância oral ou contexto específico.
- Risco de reação de hipersensibilidade — ambiente preparado.`,
    },
    {
      external_id: "gold-anvisa-manip",
      title: "ANVISA — princípios de Boas Práticas de Manipulação (visão do prescritor).",
      authors: "ANVISA (síntese Doutiva)",
      journal: "Regulação BR",
      year: 2022,
      doi: null,
      url: "https://www.gov.br/anvisa/",
      study_design: "Regulation",
      evidence_level: "A",
      tags: ["ouro", "ANVISA", "manipulação"],
      abstract: "Compounding pharmacies must follow quality/GMP-like rules; prescription needs clinical justification.",
      full_text: `# ANVISA / manipulação
- Prescrição justificada; lote; farmacovigilância.
- Publicidade enganosa de drips é risco ético/sanitário.`,
    },
  ],

  "obesidade-precisao-consultorio": [
    {
      external_id: "gold-who-obesity",
      title: "Obesity as a chronic disease — clinical framing.",
      authors: "WHO / Obesity societies (síntese Doutiva)",
      journal: "Framework",
      year: 2020,
      doi: null,
      url: null,
      study_design: "Framework",
      evidence_level: "A",
      tags: ["ouro", "obesidade", "doença crônica"],
      abstract: "Obesity is chronic, relapsing; treatment includes lifestyle, pharmacotherapy, surgery; avoid stigma.",
      full_text: `# Obesidade doença crônica
- Set point / reganho esperado.
- Metas além da balança.
- Linguagem não estigmatizante.`,
    },
    {
      external_id: "gold-step4-regain",
      title: "Effect of Continued Weekly Semaglutide vs Placebo on Weight Loss Maintenance (STEP 4).",
      authors: "Rubino D, et al.",
      journal: "JAMA",
      year: 2021,
      doi: "10.1001/jama.2021.3224",
      url: "https://doi.org/10.1001/jama.2021.3224",
      study_design: "Phase 3 RCT",
      evidence_level: "A",
      tags: ["ouro", "manutenção", "semaglutida"],
      abstract: "Continued semaglutide maintains weight loss; withdrawal leads to regain.",
      full_text: `# STEP 4
- Manutenção farmacológica importa.
- Planejar longo prazo e custo.`,
    },
  ],

  "sarcopenia-composicao-performance": [
    {
      external_id: "gold-ewgsop2",
      title: "Sarcopenia: revised European consensus on definition and diagnosis (EWGSOP2).",
      authors: "Cruz-Jentoft AJ, et al.",
      journal: "Age Ageing",
      year: 2019,
      doi: "10.1093/ageing/afy169",
      url: "https://doi.org/10.1093/ageing/afy169",
      study_design: "Consensus",
      evidence_level: "A",
      tags: ["ouro", "sarcopenia", "EWGSOP2"],
      abstract: "Find-Assess-Confirm-Severity; low muscle strength primary; DXA/BIA for mass; physical performance for severity.",
      full_text: `# EWGSOP2
- Força primeiro (ex. handgrip/chair stand).
- Massa: DEXA/BIA.
- Severidade: velocidade de marcha/SPPB.
- Tratar causa + proteína + resistência.`,
    },
    {
      external_id: "gold-lean-glp1",
      title: "Lean mass changes with GLP-1–based therapies — mitigation strategies.",
      authors: "Neeland IJ, et al. (síntese)",
      journal: "Diabetes Obes Metab",
      year: 2024,
      doi: null,
      url: null,
      study_design: "Narrative / evidence synthesis",
      evidence_level: "B",
      tags: ["ouro", "massa magra", "GLP-1"],
      abstract: "Weight loss includes lean mass fraction; resistance training and protein intake are key mitigators.",
      full_text: `# Magra sob incretina
- Parte da perda é magra.
- Proteína ~1,2–1,6+ g/kg conforme contexto; treino de força.
- Considerar DEXA em alto risco.`,
    },
  ],

  "ia-pratica-medica": [
    {
      external_id: "gold-llm-clinical",
      title: "Large language models in medicine — opportunities and risks.",
      authors: "Síntese Doutiva / literatura 2023–2025",
      journal: "Evidence synthesis",
      year: 2024,
      doi: null,
      url: null,
      study_design: "Evidence synthesis",
      evidence_level: "B",
      tags: ["ouro", "LLM", "IA", "segurança"],
      abstract: "LLMs can hallucinate; physician remains accountable; use for drafting with mandatory verification.",
      full_text: `# LLM em medicina
- Alucinação é risco central.
- Nunca aceitar dose sem checar bula/guideline.
- Documentar uso quando influencia conduta.`,
    },
    {
      external_id: "gold-lgpd-saude",
      title: "LGPD e dados sensíveis de saúde — mínimo para o consultório.",
      authors: "Síntese Doutiva (LGPD)",
      journal: "Regulação BR",
      year: 2020,
      doi: null,
      url: "https://www.gov.br/anpd/",
      study_design: "Regulation",
      evidence_level: "A",
      tags: ["ouro", "LGPD", "privacidade"],
      abstract: "Health data are sensitive; lawful basis, minimization, vendor due diligence required.",
      full_text: `# LGPD saúde
- Dado sensível.
- Evitar colar PHI em LLM consumer.
- Preferir contratos/enterprise; registrar incidentes.`,
    },
  ],

  "peptideos-medicina-de-precisao": [
    {
      external_id: "gold-fda-cat2-peptides",
      title: "FDA Category 2 bulk substances for compounding — peptides safety concerns.",
      authors: "U.S. FDA (síntese Doutiva)",
      journal: "Regulatory",
      year: 2023,
      doi: null,
      url: "https://www.fda.gov/drugs/human-drug-compounding",
      study_design: "Regulation",
      evidence_level: "A",
      tags: ["ouro", "FDA", "BPC-157", "peptídeos"],
      abstract: "Certain peptides nominated for compounding face significant safety concerns (Category 2).",
      full_text: `# FDA Category 2
- BPC-157 e outros: preocupações de segurança para compounding.
- No BR: não tratar research peptide como terapia estabelecida.`,
    },
  ],
};

export function packForCourse(slug) {
  return GOLD_PACKS[slug] || [];
}

export function allGoldRows() {
  const rows = [];
  for (const [slug, pack] of Object.entries(GOLD_PACKS)) {
    for (const r of pack) {
      rows.push({
        source_type: "guideline",
        external_id: r.external_id,
        title: r.title,
        authors: r.authors,
        journal: r.journal,
        year: r.year,
        doi: r.doi,
        url: r.url,
        study_design: r.study_design,
        evidence_level: r.evidence_level,
        abstract: r.abstract,
        full_text: r.full_text,
        tags: [...(r.tags || []), "doutiva-ouro", slug],
        notes: `Gold pack Doutiva raise-bar · ${slug}`,
      });
    }
  }
  return rows;
}
