#!/usr/bin/env node
/**
 * Insert lessons 10–15 for Peptídeos (stubs) and refresh course marketing copy / duration.
 * Usage: node --env-file=.env scripts/expand-peptides-curriculum.mjs
 */
import { readFileSync } from "node:fs";
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

const NEW_LESSONS = [
  {
    position: 10,
    module_position: 6,
    module_title: "Módulo 6 · Fronteira terapêutica",
    title: "Agonistas dual/triplo e incretinas orais: retatrutida, CagriSema, survodutida, orforglipron",
    description:
      "Leitura crítica da fronteira 2024–2026: triplo agonismo GIP/GLP-1/glucagon, coagonismo amilina, orais small-molecule e o que isso muda (e ainda não muda) na prática brasileira.",
    duration_minutes: 90,
    evidence_level: "Nível A (fase 3 em andamento/publicados) · Nível B (orais)",
  },
  {
    position: 11,
    module_position: 6,
    module_title: "Módulo 6 · Fronteira terapêutica",
    title: "Organoproteção além do peso: SELECT, FLOW, HFpEF, AOS, MASLD/MASH e desfechos duros",
    description:
      "Como traduzir desfechos cardiovasculares, renais, hepáticos e respiratórios dos grandes ECRs em critérios de seleção no consultório — além da balança.",
    duration_minutes: 90,
    evidence_level: "Nível A",
  },
  {
    position: 12,
    module_position: 7,
    module_title: "Módulo 7 · Composição corporal e populações especiais",
    title: "Sarcopenia iatrogênica, massa magra, DEXA, proteína e treino sob incretina",
    description:
      "Mitigação de perda de massa magra: alvos de proteína, resistência, DEXA/BIA, quando pausar, e comunicação honesta sobre “Ozempic face” e force plateaus.",
    duration_minutes: 75,
    evidence_level: "Nível B (ensaios + consenso clínico)",
  },
  {
    position: 13,
    module_position: 7,
    module_title: "Módulo 7 · Composição corporal e populações especiais",
    title: "Populações especiais: gestação/contracepção, adolescente, idoso, DRC avançada e perioperatório",
    description:
      "Ajustes de indicação e segurança em fenômenos críticos: fertilidade, adolescente com obesidade, fragilidade, DRC G4–G5 e anestesia com esvaziamento gástrico retardado.",
    duration_minutes: 75,
    evidence_level: "Nível A–B (rótulos + consensos) · Nível C (perioperatório)",
  },
  {
    position: 14,
    module_position: 8,
    module_title: "Módulo 8 · Armamentário peptídico ampliado",
    title: "Mapa do armamentário peptídico com registro: setmelanotida, análogos de PTH, somatostatina e fronteiras",
    description:
      "Além das incretinas: peptídeos com indicação clara (MC4R, osteoporose, acromegalia/NETs) versus extrapolação estética — como orientar o paciente informado pelas redes.",
    duration_minutes: 75,
    evidence_level: "Nível A (indicações registradas) · Nível D (extrapolação)",
  },
  {
    position: 15,
    module_position: 8,
    module_title: "Módulo 8 · Armamentário peptídico ampliado",
    title: "Clínica de excelência: documentação, consentimento, falha terapêutica, transição entre agentes e economia BR",
    description:
      "Operacionalizar a clínica vendável e ética: prontuário, TCLE, critérios de sucesso/falha, switch semaglutida↔tirzepatida, acesso, custo e comunicação de valor.",
    duration_minutes: 90,
    evidence_level: "Nível B (prática baseada em evidência + regulatório)",
  },
];

async function main() {
  const { data: course, error } = await supabase
    .from("courses")
    .select("id, duration_minutes")
    .eq("slug", "peptideos-medicina-de-precisao")
    .single();
  if (error) throw error;

  for (const L of NEW_LESSONS) {
    const { data: existing } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", course.id)
      .eq("position", L.position)
      .maybeSingle();

    const row = {
      course_id: course.id,
      position: L.position,
      module_position: L.module_position,
      module_title: L.module_title,
      title: L.title,
      description: L.description,
      duration_minutes: L.duration_minutes,
      evidence_level: L.evidence_level,
      status: "draft",
      content: `# ${L.title}\n\nConteúdo em geração — monografia e slides serão preenchidos pelo deepen.`,
      key_points: [],
      refs: [],
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error: u } = await supabase.from("lessons").update(row).eq("id", existing.id);
      if (u) throw u;
      console.log("updated stub", L.position, L.title.slice(0, 60));
    } else {
      const { error: i } = await supabase.from("lessons").insert(row);
      if (i) throw i;
      console.log("inserted stub", L.position, L.title.slice(0, 60));
    }
  }

  const totalMinutes = 9 * 90 + 6 * 80; // approx; deepen will overwrite per-lesson
  const { error: cu } = await supabase
    .from("courses")
    .update({
      duration_minutes: totalMinutes,
      description:
        "Quinze aulas em profundidade de tratado (~20h): farmacologia molecular, regulatório ANVISA/CFM/WADA, fisiologia GLP-1/GIP, ECRs STEP/SURMOUNT/SELECT/FLOW, segurança e massa magra, secretagogos de GH, regenerativos (ciência vs hype), protocolo de consultório, casos integrados, fronteira dual/triplo/orais, organoproteção, sarcopenia, populações especiais, armamentário peptídico ampliado e excelência operacional da clínica. Cada aula: monografia densa, 8–12 slides com dados, guia de bolso e caso clínico com gabarito server-side.",
      subtitle: "Tratado clínico completo · 15 aulas · monografias + slides + casos",
      level: "Avançado",
      featured: true,
      published: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", course.id);
  if (cu) throw cu;

  // Enrich protocol for marketplace sellability
  const protocolBody = `# Protocolo clínico Doutiva — Peptídeos / Incretinas no consultório

> Material educacional para médicos. Não substitui bula, diretrizes atualizadas nem julgamento clínico.

## 1. Triagem inicial
- IMC, comorbidades (DM2, DCV, DRC, AOS, MASLD, HFpEF), história de MTC/MEN2, gestação/planejamento, uso de insulina/SU, cirurgias bariátricas, atletismo federado (WADA).
- Excluir pedido de peptídeo sem registro (BPC-157, TB-500, CJC/ipa anti-aging) — documentar recusa fundamentada.

## 2. Exames basais sugeridos
- HbA1c, glicemia, lipidograma, função renal (TFGe), TGO/TGP, amilase/lipase se história sugestiva, TSH se indicado, β-HCG quando pertinente.
- Considerar DEXA se sarcopenia/risco de perda magra elevada.

## 3. Escolha do agente
| Perfil | Preferência típica | Notas |
|---|---|---|
| Obesidade + DCV sem DM | Semaglutida (base SELECT) | Confirmar disponibilidade/indicação local |
| Obesidade com meta ≥15–20% | Tirzepatida (SURMOUNT) | Titulação mais lenta se GI intenso |
| DM2 + DRC | Semaglutida (FLOW) / conforme rótulo | Ajuste por TFGe |
| Falha parcial em sema | Avaliar aderência → switch para tirze | Documentar critérios |

## 4. Titulação e antiemese
- Seguir bula; não acelerar degraus se náusea ≥ moderada.
- Orientar refeições menores, evitar lipídios altos no início, antiemético curto se necessário.
- Pausar 1 degrau se intolerância; retomar quando estável.

## 5. Monitoramento
- Peso, circunferência, sintomas GI, adesão, força/funcionalidade.
- Reavaliar em 12–16 semanas: ≥5% = resposta mínima; ≥10–15% = sucesso robusto.
- Vigilância: vesícula, visão (retinopatia em DM), humor, massa magra.

## 6. Manutenção e descontinuação
- Planejar manutenção; reganho é esperado se cessar sem estratégia.
- Documentar consentimento informado sobre uso prolongado e custo.

## 7. O que NÃO entra neste protocolo
- Peptídeos Category 2 / research-use-only / WADA S0–S2 sem indicação registrada.
- GH ou secretagogos para “anti-aging” (CFM 2.333/2023).

---
*Versão Doutiva · currículo Peptídeos v2 · atualizar conforme bulas e diretrizes.*
`;

  await supabase.from("protocol_documents").upsert(
    {
      slug: "incretina-consultorio",
      title: "Protocolo clínico — incretina / peptídeos no consultório",
      body_markdown: protocolBody,
      active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  );

  console.log("course + protocol updated; stubs 10–15 ready");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
