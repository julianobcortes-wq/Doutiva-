#!/usr/bin/env node
/**
 * Heavy scientific authority validation across published clinical lessons.
 * Checks: DOI/PMID resolvability, placeholder refs, AI-smell citations,
 * missing evidence anchors, thin bibliography, high "verificar" density.
 *
 * Usage:
 *   node --env-file=.env scripts/validate-scientific-authority.mjs
 *   node --env-file=.env scripts/validate-scientific-authority.mjs --course=longevidade-medicina-evidencia
 *   node --env-file=.env scripts/validate-scientific-authority.mjs --fix-critical  (writes triage JSON only; remediation is separate)
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const courseArg = (process.argv.find((a) => a.startsWith("--course=")) || "").split("=")[1];
const SKIP = new Set(["Negócios"]);

const DOI_RE = /\b10\.\d{4,9}\/[^\s\]\)>"']+/gi;
const PMID_RE = /\bPMID[:\s]*(\d{5,9})\b/gi;
const URL_RE = /https?:\/\/[^\s\]\)>"']+/gi;

/** Patterns that often signal fabricated or unusable citations for physicians */
const AI_SMELL = [
  /et al\.?,?\s*\(\d{4}\)\.\s*[A-Z][^.…]{8,80}\.\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\.?\s*\d{4};/i, // overly neat fake journal lines
  /doi:\s*10\.\d{4}\/fake/i,
  /example\.com|placeholder|lorem ipsum/i,
  /\bverificar\b/i,
  /\bTODO\b|\bTBD\b|\binsert citation\b/i,
  /\bAuthor Unknown\b|\bUnknown Author\b/i,
  /\bJournal of Longevity Medicine\b/i, // common hallucinated journal name
  /\bInternational Journal of Anti[- ]?Aging\b/i,
];

function extractDois(text) {
  const out = new Set();
  for (const m of String(text || "").matchAll(DOI_RE)) {
    let d = m[0].replace(/[.,);]+$/, "").toLowerCase();
    out.add(d);
  }
  return [...out];
}

function extractPmids(text) {
  const out = new Set();
  for (const m of String(text || "").matchAll(PMID_RE)) out.add(m[1]);
  return [...out];
}

function extractUrls(text) {
  const out = new Set();
  for (const m of String(text || "").matchAll(URL_RE)) {
    out.add(m[0].replace(/[.,);]+$/, ""));
  }
  return [...out];
}

function scoreRef(ref) {
  const citation = String(ref?.citation || "");
  const url = String(ref?.url || "");
  const blob = `${citation} ${url}`;
  const issues = [];
  if (!citation.trim()) issues.push("empty_citation");
  if (/verificar/i.test(blob)) issues.push("verificar");
  if (citation.trim().length < 24) issues.push("too_short");
  if (/^https?:\/\//i.test(citation) && citation.length < 40) issues.push("url_as_citation");
  for (const re of AI_SMELL) {
    if (re.test(blob)) {
      issues.push("ai_smell");
      break;
    }
  }
  // Vague: no year, no org, no trial name cues
  const hasYear = /\b(19|20)\d{2}\b/.test(citation);
  const hasOrg =
    /Endocrine Society|ADA|AHA|ACC|ATA|AACE|ABESO|SBEM|FEBRASGO|CFM|ANVISA|WHO|OMS|NICE|USPSTF|EWGSOP|NAMS|IMS|EAU|ASA|FDA|EMA|CALERIE|TAME|SELECT|SURMOUNT|STEP|SURPASS|FLOW|WHI|López-Otín|Lopez-Otin|Jastreboff|Wilding|Lincoff|Bhasin|Rubino|Garvey/i.test(
      citation,
    );
  const hasDoi = extractDois(blob).length > 0;
  const hasPmid = extractPmids(blob).length > 0;
  if (!hasYear && !hasOrg && !hasDoi && !hasPmid && !/guideline|diretriz|resolu/i.test(citation)) {
    issues.push("vague");
  }
  return { citation: citation.slice(0, 180), url: url || null, issues, hasDoi, hasPmid, hasOrg, hasYear };
}

const doiCache = new Map();
async function resolveDoi(doi) {
  if (doiCache.has(doi)) return doiCache.get(doi);
  const ctrl = AbortSignal.timeout(12000);
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { "User-Agent": "DoutivaScientificAudit/1.0 (mailto:editorial@doutiva.local)" },
      signal: ctrl,
    });
    if (res.status === 404) {
      const r = { ok: false, status: 404 };
      doiCache.set(doi, r);
      return r;
    }
    if (!res.ok) {
      const r = { ok: null, status: res.status }; // unknown / rate limit
      doiCache.set(doi, r);
      return r;
    }
    const json = await res.json();
    const msg = json.message || {};
    const r = {
      ok: true,
      status: 200,
      title: Array.isArray(msg.title) ? msg.title[0] : msg.title,
      container: Array.isArray(msg["container-title"]) ? msg["container-title"][0] : undefined,
      year: msg.issued?.["date-parts"]?.[0]?.[0],
    };
    doiCache.set(doi, r);
    return r;
  } catch (e) {
    const r = { ok: null, status: 0, error: String(e.message || e) };
    doiCache.set(doi, r);
    return r;
  }
}

async function mapPool(items, concurrency, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return out;
}

function lessonRisk({ mono, refsScored, anchors, doiBad, doiUnknown }) {
  // "verificar bula/laudo/ANVISA" is clinical Portuguese — only count citation/placeholder uses
  const verificarPlaceholder = (mono.match(/\bDOI:\s*verificar\b|\bverificar\s+refer|\(verificar\)|\bverificar\b(?!\s+(bula|laudo|atualiza|especifica|ANVISA|rotulo|rótulo))/gi) || []).length;
  const verificar =
    verificarPlaceholder +
    refsScored.filter((r) => r.issues.includes("verificar")).length;
  const vague = refsScored.filter((r) => r.issues.includes("vague")).length;
  const ai = refsScored.filter((r) => r.issues.includes("ai_smell")).length;
  const shortRefs = refsScored.length < 5;
  const noAnchors = !anchors;
  let severity = "OK";
  const reasons = [];
  if (doiBad > 0) {
    severity = "CRITICAL";
    reasons.push(`${doiBad} DOI(s) não resolvem no Crossref (possível citação inventada)`);
  }
  if (ai > 0 && severity !== "CRITICAL") {
    severity = "HIGH";
    reasons.push(`${ai} ref(s) com padrão AI-smell`);
  }
  if (verificar >= 8 || (verificar >= 4 && shortRefs)) {
    if (severity === "OK") severity = "HIGH";
    reasons.push(`alta densidade de "verificar" (${verificar})`);
  } else if (verificar >= 3 && severity === "OK") {
    severity = "MED";
    reasons.push(`"verificar" residual (${verificar})`);
  }
  if (noAnchors) {
    severity = severity === "OK" ? "HIGH" : severity;
    reasons.push("sem seção Âncoras de evidência");
  }
  if (shortRefs) {
    if (severity === "OK") severity = "MED";
    reasons.push(`bibliografia fina (${refsScored.length} refs)`);
  }
  if (vague >= 3) {
    if (severity === "OK") severity = "MED";
    reasons.push(`${vague} citações vagas`);
  }
  if (doiUnknown > 0 && severity === "OK") {
    severity = "MED";
    reasons.push(`${doiUnknown} DOI(s) com resolução inconclusiva`);
  }
  return { severity, reasons, verificar, vague, ai, shortRefs, noAnchors };
}

async function main() {
  mkdirSync("docs", { recursive: true });
  mkdirSync("/tmp/scientific-audit", { recursive: true });

  let q = supabase.from("courses").select("id,slug,title,category").eq("published", true).order("title");
  if (courseArg) q = q.eq("slug", courseArg);
  const { data: courses, error } = await q;
  if (error) throw error;

  const lessonsOut = [];
  const allDois = new Set();

  for (const c of courses || []) {
    if (SKIP.has(c.category)) continue;
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id,position,title,monograph,refs,evidence_level,status")
      .eq("course_id", c.id)
      .eq("status", "published")
      .order("position");

    for (const L of lessons || []) {
      const mono = L.monograph || "";
      const refs = Array.isArray(L.refs) ? L.refs : [];
      const refsScored = refs.map(scoreRef);
      const blob = `${mono}\n${refs.map((r) => `${r.citation || ""} ${r.url || ""}`).join("\n")}`;
      const dois = extractDois(blob);
      const pmids = extractPmids(blob);
      const urls = extractUrls(blob);
      for (const d of dois) allDois.add(d);
      const anchors = /## Âncoras de evidência/i.test(mono);
      lessonsOut.push({
        course: c.slug,
        title: c.title,
        category: c.category,
        position: L.position,
        lessonTitle: L.title,
        lessonId: L.id,
        mono,
        monoLen: mono.length,
        evidence_level: L.evidence_level,
        refsScored,
        refCount: refs.length,
        dois,
        pmids,
        urlCount: urls.length,
        anchors,
      });
    }
  }

  console.log(`lessons=${lessonsOut.length} unique_dois=${allDois.size}`);
  const doiList = [...allDois];
  const doiResults = await mapPool(doiList, 6, async (doi) => {
    const r = await resolveDoi(doi);
    if (r.ok === false) console.log("DOI_BAD", doi);
    else if (r.ok === true) console.log("DOI_OK", doi, (r.title || "").slice(0, 60));
    else console.log("DOI_UNK", doi, r.status);
    return { doi, ...r };
  });
  const doiMap = Object.fromEntries(doiResults.map((r) => [r.doi, r]));

  const rows = [];
  for (const L of lessonsOut) {
    let doiBad = 0;
    let doiOk = 0;
    let doiUnknown = 0;
    const doiDetail = [];
    for (const d of L.dois) {
      const r = doiMap[d];
      if (!r || r.ok === null) doiUnknown++;
      else if (r.ok === false) {
        doiBad++;
        doiDetail.push({ doi: d, bad: true });
      } else {
        doiOk++;
        doiDetail.push({ doi: d, title: r.title, year: r.year, container: r.container });
      }
    }
    const risk = lessonRisk({
      mono: L.mono,
      refsScored: L.refsScored,
      anchors: L.anchors,
      doiBad,
      doiUnknown,
    });
    const { mono, refsScored, ...rest } = L;
    rows.push({
      ...rest,
      doiBad,
      doiOk,
      doiUnknown,
      doiDetail,
      risk,
      verificar: risk.verificar,
    });
  }

  const bySev = { CRITICAL: [], HIGH: [], MED: [], OK: [] };
  for (const r of rows) bySev[r.risk.severity].push(r);

  const byCourse = {};
  for (const r of rows) {
    if (!byCourse[r.course]) {
      byCourse[r.course] = {
        title: r.title,
        category: r.category,
        n: 0,
        critical: 0,
        high: 0,
        med: 0,
        ok: 0,
        anchors: 0,
        doiBad: 0,
        avgRefs: 0,
        refsSum: 0,
      };
    }
    const b = byCourse[r.course];
    b.n++;
    b[r.risk.severity.toLowerCase()]++;
    if (r.anchors) b.anchors++;
    b.doiBad += r.doiBad;
    b.refsSum += (r.doiOk || 0); // placeholder; fix below
  }

  for (const b of Object.values(byCourse)) b.refsSum = 0;
  for (const r of rows) byCourse[r.course].refsSum += r.refCount || 0;
  for (const b of Object.values(byCourse)) {
    b.avgRefs = b.n ? +(b.refsSum / b.n).toFixed(1) : 0;
    delete b.refsSum;
  }

  const report = {
    generated_at: new Date().toISOString(),
    timezone_note: "America/Sao_Paulo for editorial; timestamps UTC",
    totals: {
      lessons: rows.length,
      critical: bySev.CRITICAL.length,
      high: bySev.HIGH.length,
      med: bySev.MED.length,
      ok: bySev.OK.length,
      unique_dois: doiList.length,
      doi_ok: doiResults.filter((d) => d.ok === true).length,
      doi_bad: doiResults.filter((d) => d.ok === false).length,
      doi_unknown: doiResults.filter((d) => d.ok === null).length,
    },
    byCourse,
    critical: bySev.CRITICAL.map(compactLesson),
    high: bySev.HIGH.map(compactLesson),
    med_sample: bySev.MED.slice(0, 40).map(compactLesson),
    bad_dois: doiResults.filter((d) => d.ok === false).map((d) => d.doi),
  };

  writeFileSync("docs/scientific-authority-audit.json", JSON.stringify(report, null, 2));
  writeFileSync("/tmp/scientific-audit/full-rows.json", JSON.stringify(rows, null, 2));

  // Markdown report for physicians/editorial
  const md = renderMd(report);
  writeFileSync("docs/scientific-authority-audit.md", md);

  console.log("\n=== TOTALS ===");
  console.log(JSON.stringify(report.totals, null, 2));
  console.log("CRITICAL", report.critical.length);
  console.log("HIGH", report.high.length);
  console.log("wrote docs/scientific-authority-audit.md");
}

function compactLesson(r) {
  return {
    course: r.course,
    position: r.position,
    title: r.lessonTitle,
    severity: r.risk.severity,
    reasons: r.risk.reasons,
    refCount: r.refCount,
    verificar: r.verificar,
    doiBad: r.doiBad,
    anchors: r.anchors,
  };
}

function renderMd(report) {
  const lines = [];
  lines.push("# Auditoria de autoridade científica — Doutiva");
  lines.push("");
  lines.push(`Gerado: ${report.generated_at} (UTC). Escopo: aulas clínicas publicadas (exclui Negócios).`);
  lines.push("");
  lines.push("## Veredito executivo");
  lines.push("");
  lines.push(
    `| Métrica | Valor |\n|--------|-------|\n| Aulas auditadas | ${report.totals.lessons} |\n| CRITICAL | **${report.totals.critical}** |\n| HIGH | **${report.totals.high}** |\n| MED | ${report.totals.med} |\n| OK | ${report.totals.ok} |\n| DOIs únicos | ${report.totals.unique_dois} |\n| DOIs Crossref OK | ${report.totals.doi_ok} |\n| DOIs Crossref FALHA | **${report.totals.doi_bad}** |\n| DOIs inconclusivos | ${report.totals.doi_unknown} |`,
  );
  lines.push("");
  lines.push("### Leitura para médico/editorial");
  lines.push("");
  if (report.totals.doi_bad > 0) {
    lines.push(
      `- Há **${report.totals.doi_bad} DOI(s) que não resolvem** no Crossref — risco máximo de citação inventada. Remediação obrigatória antes de vender autoridade.`,
    );
  } else {
    lines.push("- Nenhum DOI inventado detectado via Crossref nesta passada (ou poucos DOIs explícitos — muitos cursos citam guideline/trial pelo nome, o que é aceitável se a âncora for real).");
  }
  lines.push(
    `- CRITICAL/HIGH devem ser limpos: placeholders \`verificar\`, bibliografia fina, ou padrão de citação suspeita.`,
  );
  lines.push("");
  lines.push("## Por curso");
  lines.push("");
  lines.push("| Curso | Aulas | CRIT | HIGH | MED | OK | Âncoras | DOIs bad | Avg refs |");
  lines.push("|-------|------:|-----:|-----:|----:|---:|--------:|---------:|---------:|");
  for (const [slug, b] of Object.entries(report.byCourse).sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(
      `| ${slug} | ${b.n} | ${b.critical} | ${b.high} | ${b.med} | ${b.ok} | ${b.anchors}/${b.n} | ${b.doiBad} | ${b.avgRefs} |`,
    );
  }
  lines.push("");
  lines.push("## CRITICAL");
  lines.push("");
  if (!report.critical.length) lines.push("_Nenhum._");
  for (const r of report.critical) {
    lines.push(`- **${r.course}#${r.position}** — ${r.title}`);
    lines.push(`  - ${r.reasons.join("; ")}`);
  }
  lines.push("");
  lines.push("## HIGH");
  lines.push("");
  if (!report.high.length) lines.push("_Nenhum._");
  for (const r of report.high) {
    lines.push(`- **${r.course}#${r.position}** — ${r.title}`);
    lines.push(`  - ${r.reasons.join("; ")}`);
  }
  lines.push("");
  lines.push("## DOIs que falharam no Crossref");
  lines.push("");
  if (!report.bad_dois.length) lines.push("_Nenhum._");
  else for (const d of report.bad_dois) lines.push(`- \`${d}\``);
  lines.push("");
  lines.push("## Método");
  lines.push("");
  lines.push("1. Extrai refs + monografia de cada aula publicada clínica.");
  lines.push("2. Classifica refs: `verificar`, vaga, AI-smell, curta.");
  lines.push("3. Resolve DOIs via API Crossref (`/works/{doi}`).");
  lines.push("4. Exige seção `## Âncoras de evidência`.");
  lines.push("5. Severidade: DOI inválido = CRITICAL; AI-smell / sem âncoras / verificar alto = HIGH.");
  lines.push("");
  lines.push("## Limitações");
  lines.push("");
  lines.push("- Citação correta **sem DOI** (guideline CFM/ANVISA/trial pelo nome) pode ser boa e não aparece em Crossref.");
  lines.push("- Crossref rate-limit pode marcar DOI como inconclusivo (MED), não como inventado.");
  lines.push("- Não substitui revisão médica humana linha a linha — é barreira anti-humilhação pré-lançamento.");
  lines.push("");
  return lines.join("\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
