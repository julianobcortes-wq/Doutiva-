#!/usr/bin/env node
/**
 * Re-generate slides + quick_ref for peptide lessons that have too few slides,
 * using the existing monograph as source of truth.
 *
 * Usage: node --env-file=.env --import tsx scripts/repair-peptide-slides.mjs
 *        node --env-file=.env --import tsx scripts/repair-peptide-slides.mjs --min=8
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { streamText, Output } from "ai";
import { z } from "zod";

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

const minSlides = Number((process.argv.find((a) => a.startsWith("--min=")) || "--min=8").split("=")[1]);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const slideSchema = z.object({
  kind: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  text: z.string().nullable(),
  items: z.array(z.string()),
  rightItems: z.array(z.string()),
  leftLabel: z.string().nullable(),
  rightLabel: z.string().nullable(),
  head: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  unit: z.string().nullable(),
  source: z.string().nullable(),
  note: z.string().nullable(),
});

const outSchema = z.object({
  slides: z.array(slideSchema).min(8).max(12),
  quick_ref: z.string(),
});

function toSlide(s) {
  const t = s.title;
  const kind = String(s.kind || "")
    .toLowerCase()
    .trim();
  switch (kind) {
    case "title":
      return { kind: "title", title: t, subtitle: s.subtitle ?? undefined };
    case "bullet":
    case "bullets":
      return {
        kind: "bullets",
        title: t,
        bullets: s.items?.length ? s.items : [s.text || s.subtitle || t].filter(Boolean),
        note: s.note ?? undefined,
      };
    case "bar":
    case "bars":
      return {
        kind: "bars",
        title: t,
        unit: s.unit ?? "",
        source: s.source ?? "",
        note: s.note ?? undefined,
        bars: (s.items || []).map((it, i, arr) => {
          const [label, v] = String(it).split("|");
          return {
            label: (label ?? "").trim(),
            value: Number((v ?? "").replace(",", ".").replace(/[^\d.-]/g, "")) || 0,
            highlight: i === arr.length - 1,
          };
        }),
      };
    case "flow":
    case "steps":
    case "algorithm":
      return {
        kind: "flow",
        title: t,
        note: s.note ?? undefined,
        steps: (s.items || []).map((it) => {
          const [label, detail] = String(it).split(/\s+—\s+|\s+-\s+/);
          return { label: (label ?? "").trim(), detail: detail?.trim() };
        }),
      };
    case "table":
      return {
        kind: "table",
        title: t,
        head: s.head?.length ? s.head : ["Item", "Detalhe"],
        rows: s.rows?.length ? s.rows : (s.items || []).map((it) => [String(it), ""]),
        source: s.source ?? undefined,
      };
    case "split":
    case "compare":
      return {
        kind: "split",
        title: t,
        left: { label: s.leftLabel ?? "A", items: s.items || [] },
        right: { label: s.rightLabel ?? "B", items: s.rightItems || [] },
      };
    case "pearl":
    case "takeaway":
      return { kind: "pearl", title: t, text: s.text ?? s.subtitle ?? (s.items || [])[0] ?? "", source: s.source ?? undefined };
    default:
      // Never drop a slide — coerce unknown kinds to bullets.
      return {
        kind: "bullets",
        title: t || "Nota",
        bullets: s.items?.length ? s.items : [s.text || s.subtitle || "Ver monografia"].filter(Boolean),
        note: s.note ?? `kind original: ${s.kind}`,
      };
  }
}

async function main() {
  const { createGatewayOpenAI, doutivaChatModel, doutivaOpenAIProviderOptions, requireAiApiKey } =
    await import("../src/lib/ai-provider.server.ts");
  requireAiApiKey();
  const openai = createGatewayOpenAI();

  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", "peptideos-medicina-de-precisao")
    .single();
  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("id, position, title, monograph, slides, quick_ref")
    .eq("course_id", course.id)
    .eq("status", "published")
    .order("position");
  if (error) throw error;

  mkdirSync("/tmp/repair-slides", { recursive: true });
  for (const L of lessons || []) {
    const n = Array.isArray(L.slides) ? L.slides.length : 0;
    if (n >= minSlides && (L.quick_ref || "").length > 400) {
      console.log(`skip ${L.position} slides=${n}`);
      continue;
    }
    if (!(L.monograph || "").length) {
      console.log(`skip ${L.position} no monograph`);
      continue;
    }
    console.log(`repair ${L.position} was slides=${n} …`);
    let slides = [];
    let quickRef = L.quick_ref || "";
    for (let attempt = 1; attempt <= 3 && slides.length < minSlides; attempt++) {
      const structured = streamText({
        model: doutivaChatModel(openai),
        system: `Você é designer instrucional médico da Doutiva. A partir da MONOGRAFIA, produza EXATAMENTE 10 slides densos para médicos + quick_ref.
Kinds permitidos: title | bullets | bars | flow | table | split | pearl.
Sequência obrigatória aproximada:
1 title, 2 bullets (objetivos), 3 table (ensaios/doses), 4 bars (números), 5 flow (algoritmo), 6 split (contraste), 7 table ou bullets (segurança), 8 bullets (checklist), 9 split ou bullets (regulatório), 10 pearl.
Não invente fatos ausentes da monografia. Português do Brasil. Tentativa ${attempt}.`,
        prompt: `Título: ${L.title}\n\n=== MONOGRAFIA ===\n${L.monograph}`,
        output: Output.object({ schema: outSchema }),
        providerOptions: doutivaOpenAIProviderOptions("medium"),
      });
      const o = await structured.output;
      slides = o.slides.map(toSlide).filter(Boolean);
      quickRef = o.quick_ref || quickRef;
      console.log(`  attempt ${attempt} → raw=${o.slides.length} mapped=${slides.length}`);
    }
    if (slides.length < minSlides) {
      slides.push({
        kind: "pearl",
        title: "Para o consultório",
        text: "Julgamento clínico, evidência e conformidade regulatória valem mais do que qualquer frasco da moda.",
        source: "Doutiva",
      });
      slides.push({
        kind: "bullets",
        title: "Leia na monografia",
        bullets: [
          "Tabelas de dose e ensaios na seção de evidência crítica",
          "Checklist de seleção e monitoramento",
          "Aspectos ANVISA / CFM / WADA quando aplicável",
        ],
      });
    }
    const o = { quick_ref: quickRef };
    const { error: u } = await supabase
      .from("lessons")
      .update({
        slides,
        quick_ref: o.quick_ref,
        updated_at: new Date().toISOString(),
      })
      .eq("id", L.id);
    if (u) throw u;
    writeFileSync(`/tmp/repair-slides/${L.position}.json`, JSON.stringify({ slides, quick_ref: o.quick_ref }, null, 2));
    // refresh export if present
    try {
      const expPath = `scripts/peptides-exports/lesson-${L.position}.json`;
      const exp = JSON.parse(readFileSync(expPath, "utf8"));
      exp.slides = slides;
      exp.quick_ref = o.quick_ref;
      writeFileSync(expPath, JSON.stringify(exp, null, 2));
    } catch {
      /* export may not exist yet */
    }
    console.log(`repaired ${L.position} → slides=${slides.length} qr=${o.quick_ref.length}`);
  }
  console.log("DONE repair");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
