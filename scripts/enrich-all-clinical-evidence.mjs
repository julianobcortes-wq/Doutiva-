#!/usr/bin/env node
/**
 * Walk clinical courses from lesson 1 and enrich evidence anchors/refs.
 * Skips Negócios. Optionally only lessons missing anchors or with "verificar".
 *
 * Usage:
 *   node --env-file=.env --import tsx scripts/enrich-all-clinical-evidence.mjs
 *   node --env-file=.env --import tsx scripts/enrich-all-clinical-evidence.mjs --course=tirzepatida-incretinas-consultorio
 *   node --env-file=.env --import tsx scripts/enrich-all-clinical-evidence.mjs --weak-only
 *   node --env-file=.env --import tsx scripts/enrich-all-clinical-evidence.mjs --limit=20
 */
import { createClient } from "@supabase/supabase-js";
import { spawn } from "node:child_process";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const courseArg = (process.argv.find((a) => a.startsWith("--course=")) || "").split("=")[1];
const limitArg = Number((process.argv.find((a) => a.startsWith("--limit=")) || "").split("=")[1] || 0);
const weakOnly = process.argv.includes("--weak-only");

const SKIP_CATEGORIES = new Set(["Negócios"]);

const DOMAIN_HINTS_EXTRA = {
  "tireoide-longevidade-criterio": "ATA/AACE thyroid guidelines; RCTs T4/T3 combination; Endocrine Society.",
  "cardiometabolico-prescritor-criterio": "Endocrine Society TRT; SELECT; ACC/AHA BP/lipids; ASA GLP-1 periop; WHI/NAMS.",
  "dexa-composicao-operacional": "EWGSOP2; FNIH sarcopenia; body-comp under incretins literature.",
  "etica-publicidade-prontuario": "CFM Código de Ética / publicidade médica; LGPD; ANVISA marcos — sem inventar número de resolução se incerto.",
  "sono-cortisol-criterio": "Endocrine Society adrenal; AASM/CBT-I; apnea-metabolism literature. Adrenal fatigue = mito.",
  "fertilidade-trt-incretinas": "Endocrine Society hypogonadism; male infertility guidelines; incretin pregnancy labeling.",
  "sarcopenia-composicao-performance": "EWGSOP2; protein/resistance RCTs.",
  "ia-pratica-medica": "Ética/CFM/LGPD; evidência de IA clínica — sem inventar AUC.",
  "peptideos-medicina-de-precisao": "Hierarquia A–D; FDA category; trials só se landmark nomeado.",
};

async function main() {
  let q = supabase.from("courses").select("id, slug, title, category, published").eq("published", true);
  if (courseArg) q = q.eq("slug", courseArg);
  const { data: courses, error } = await q.order("title");
  if (error) throw error;

  const targets = [];
  for (const c of courses || []) {
    if (SKIP_CATEGORIES.has(c.category)) continue;
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, position, title, monograph, refs, status")
      .eq("course_id", c.id)
      .eq("status", "published")
      .order("position");
    for (const L of lessons || []) {
      const mono = L.monograph || "";
      const refs = L.refs || [];
      const hasAnchors = /## Âncoras de evidência/i.test(mono);
      const verificar =
        ((mono.match(/verificar/gi) || []).length || 0) +
        refs.filter((r) => /verificar/i.test(`${r.citation || ""}${r.url || ""}`)).length;
      const weak = !hasAnchors || verificar >= 3 || refs.length < 5;
      if (weakOnly && !weak) continue;
      targets.push({ slug: c.slug, position: L.position, title: L.title, weak, hasAnchors, verificar, refs: refs.length });
    }
  }

  const slice = limitArg > 0 ? targets.slice(0, limitArg) : targets;
  console.log("targets", slice.length, "of", targets.length, weakOnly ? "(weak-only)" : "(all clinical)");

  // Group by course for enrich-lesson-evidence.mjs --only=
  const byCourse = new Map();
  for (const t of slice) {
    if (!byCourse.has(t.slug)) byCourse.set(t.slug, []);
    byCourse.get(t.slug).push(t.position);
  }

  for (const [slug, positions] of byCourse) {
    // chunk positions by 4 to keep processes manageable
    for (let i = 0; i < positions.length; i += 4) {
      const chunk = positions.slice(i, i + 4);
      const only = chunk.join(",");
      console.log("\n>> enrich", slug, "only=", only);
      await new Promise((resolve, reject) => {
        const child = spawn(
          "node",
          ["--env-file=.env", "--import", "tsx", "scripts/enrich-lesson-evidence.mjs", `--course=${slug}`, `--only=${only}`],
          { stdio: "inherit", cwd: process.cwd() },
        );
        child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code} ${slug} ${only}`))));
      }).catch((e) => console.error("CHUNK_FAIL", e.message));
    }
  }
  console.log("\nENRICH-ALL DONE", slice.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
