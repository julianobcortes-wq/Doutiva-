#!/usr/bin/env node
/**
 * Seed the Scientific Library with high-evidence PubMed + ClinicalTrials.gov hits
 * for the peptides / incretin curriculum, then embed with DOUTIVA_EMBED_MODEL.
 *
 * Usage: node --env-file=.env scripts/seed-scientific-library.mjs
 */
import { readFileSync } from "node:fs";

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

const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const aiBase = (process.env.AI_GATEWAY_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const aiKey = process.env.OPENAI_API_KEY;
const model = process.env.DOUTIVA_EMBED_MODEL || "text-embedding-3-small";
if (!base || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required");

const hdr = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

const strip = (s) =>
  String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function evidence(design) {
  const d = (design || "").toLowerCase();
  if (/meta-analysis|systematic review|randomized|phase 3|phase3|guideline/.test(d)) return "A";
  if (/phase 2|cohort|observational/.test(d)) return "B";
  if (/case|phase 1/.test(d)) return "C";
  return "—";
}

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "DoutivaSeed/1.0" } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

async function searchPmc() {
  const q =
    '(semaglutide OR tirzepatide OR "GLP-1" OR "growth hormone releasing" OR BPC-157) AND (PUB_TYPE:"randomized controlled trial" OR PUB_TYPE:"meta-analysis" OR PUB_TYPE:"systematic review" OR PUB_TYPE:"practice guideline" OR PUB_TYPE:"clinical trial, phase iii") AND SRC:MED';
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(q)}&format=json&resultType=core&pageSize=12&sort=${encodeURIComponent("CITED desc")}`;
  const j = await getJson(url);
  return (j.resultList?.result ?? []).map((r) => {
    const types = r.pubTypeList?.pubType ?? [];
    const design =
      types.filter((t) => !/journal article|research support/i.test(t)).join(", ") || "Artigo";
    const pmid = String(r.pmid ?? r.id);
    return {
      source_type: "pubmed",
      external_id: pmid,
      title: strip(r.title),
      authors: r.authorString ?? null,
      journal: r.journalInfo?.journal?.isoabbreviation ?? r.journalInfo?.journal?.title ?? null,
      year: r.pubYear ? Number(r.pubYear) : null,
      doi: r.doi ?? null,
      url: r.pmid
        ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        : `https://europepmc.org/article/MED/${r.id}`,
      study_design: design,
      evidence_level: evidence(design),
      abstract: r.abstractText ? strip(r.abstractText).slice(0, 15000) : null,
      full_text: null,
      tags: ["peptídeos", "incretinas", "evidência"],
      notes: "Seed Doutiva — Europe PMC",
    };
  });
}

async function searchTrials() {
  const url = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent("tirzepatide OR semaglutide obesity")}&pageSize=6&sort=${encodeURIComponent("EnrollmentCount:desc")}`;
  const j = await getJson(url);
  return (j.studies ?? [])
    .map((s) => {
      const p = s.protocolSection ?? {};
      const id = p.identificationModule ?? {};
      const design = p.designModule ?? {};
      const phases = design.phases ?? [];
      const studyDesign =
        [design.studyType, phases.join("/"), design.designInfo?.allocation]
          .filter(Boolean)
          .join(" · ") || "Ensaio clínico";
      const status = p.statusModule?.overallStatus ?? "";
      const outcomes = (p.outcomesModule?.primaryOutcomes ?? [])
        .slice(0, 5)
        .map((o) => `- ${o.measure} (${o.timeFrame ?? ""})`)
        .join("\n");
      const summary = [
        p.descriptionModule?.briefSummary,
        `Status: ${status}. Participantes: ${design.enrollmentInfo?.count ?? "?"}.`,
        outcomes ? `Desfechos primários:\n${outcomes}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");
      const nct = id.nctId;
      const start = p.statusModule?.startDateStruct?.date;
      return {
        source_type: "trial",
        external_id: nct,
        title: `${id.acronym ? id.acronym + " — " : ""}${id.briefTitle ?? nct}`,
        authors: p.sponsorCollaboratorsModule?.leadSponsor?.name ?? null,
        journal: "ClinicalTrials.gov",
        year: start ? Number(String(start).slice(0, 4)) : null,
        doi: null,
        url: `https://clinicaltrials.gov/study/${nct}`,
        study_design: studyDesign,
        evidence_level: evidence(`${phases.join(" ")} randomized`.replace(/PHASE3/g, "phase 3")),
        abstract: summary.slice(0, 15000),
        full_text: null,
        tags: ["ensaio", "incretinas", "registro"],
        notes: "Seed Doutiva — ClinicalTrials.gov",
      };
    })
    .filter((r) => r.external_id);
}

const guideline = {
  source_type: "guideline",
  external_id: null,
  title:
    "Posicionamento Doutiva — hierarquia de evidência para peptídeos terapêuticos no consultório",
  authors: "Conselho editorial Doutiva",
  journal: "Doutiva Editorial",
  year: 2026,
  doi: null,
  url: null,
  study_design: "Practice guideline / editorial synthesis",
  evidence_level: "A",
  abstract:
    "Síntese editorial: priorizar ECRs fase 3 e metanálises; peptídeos research-use-only não devem ser prescritos; confirmar PK humana, status ANVISA e procedência industrial.",
  full_text: `# Hierarquia de evidência para peptídeos terapêuticos

1. Metanálise de ECRs e diretrizes > ECR fase 3 > fase 2 > observacional > relato de caso.
2. Semaglutida e tirzepatida têm base fase 3 robusta.
3. Secretagogos de GH e peptídeos regenerativos (BPC-157, TB-500) carecem de evidência clínica robusta em humanos.
4. Checklist pré-prescrição: mecanismo, PK humana, ECR, registro regulatório, pureza/procedência.
`,
  tags: ["diretriz", "peptídeos", "segurança"],
  notes: "Seed editorial Doutiva",
};

async function upsert(row) {
  const res = await fetch(`${base}/rest/v1/knowledge_sources`, {
    method: "POST",
    headers: { ...hdr, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
  if (res.ok || res.status === 409) return true;
  // Partial unique index: plain insert; ignore duplicates
  if (res.status === 201) return true;
  const t = await res.text();
  if (/duplicate|23505/i.test(t)) return true;
  console.error("upsert_fail", row.external_id, t.slice(0, 200));
  return false;
}

async function embedPending() {
  if (!aiKey) {
    console.warn("OPENAI_API_KEY missing — skip embeddings");
    return 0;
  }
  const list = await fetch(
    `${base}/rest/v1/knowledge_sources?select=id,title,abstract,full_text,tags&embedding=is.null&limit=40`,
    { headers: hdr },
  ).then((r) => r.json());
  let done = 0;
  for (let i = 0; i < list.length; i += 8) {
    const chunk = list.slice(i, i + 8);
    const texts = chunk.map((s) =>
      [s.title, (s.tags || []).join(", "), s.abstract || "", (s.full_text || "").slice(0, 6000)]
        .join("\n")
        .slice(0, 8000),
    );
    const res = await fetch(`${aiBase}/embeddings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, input: texts }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(`embeddings ${res.status}: ${JSON.stringify(j).slice(0, 300)}`);
    const by = [];
    for (const d of j.data) by[d.index] = d.embedding;
    for (let k = 0; k < chunk.length; k++) {
      const u = await fetch(`${base}/rest/v1/knowledge_sources?id=eq.${chunk[k].id}`, {
        method: "PATCH",
        headers: { ...hdr, Prefer: "return=minimal" },
        body: JSON.stringify({ embedding: JSON.stringify(by[k]) }),
      });
      if (!u.ok) console.error("patch", chunk[k].id, await u.text());
      else done++;
    }
  }
  return done;
}

const rows = [...(await searchPmc()), ...(await searchTrials()), guideline];
let ok = 0;
for (const row of rows) if (await upsert(row)) ok++;
const embedded = await embedPending();
const count = await fetch(`${base}/rest/v1/knowledge_sources?select=id`, {
  headers: { ...hdr, Prefer: "count=exact", Range: "0-0" },
}).then((r) => r.headers.get("content-range"));
console.log(
  JSON.stringify(
    { seeded_attempt: rows.length, upsert_ok: ok, embedded, content_range: count },
    null,
    2,
  ),
);
