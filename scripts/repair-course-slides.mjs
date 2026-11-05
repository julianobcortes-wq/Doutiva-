#!/usr/bin/env node
/**
 * Repair thin slide decks for any published course.
 * Usage:
 *   node --env-file=.env --import tsx scripts/repair-course-slides.mjs
 *   node --env-file=.env --import tsx scripts/repair-course-slides.mjs --course=ia-pratica-medica --min=8
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
const courseArg = (process.argv.find((a) => a.startsWith("--course=")) || "").split("=")[1];

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
const outSchema = z.object({ slides: z.array(slideSchema).min(8).max(12), quick_ref: z.string() });

function sanitize(value) {
  if (typeof value === "string") return value.replace(/\u0000/g, "");
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = sanitize(v);
    return out;
  }
  return value;
}

function toSlide(s) {
  const t = s.title;
  const kind = String(s.kind || "").toLowerCase().trim();
  switch (kind) {
    case "title":
      return { kind: "title", title: t, subtitle: s.subtitle ?? undefined };
    case "bullet":
    case "bullets":
      return { kind: "bullets", title: t, bullets: s.items?.length ? s.items : [s.text || t], note: s.note ?? undefined };
    case "bar":
    case "bars":
      return {
        kind: "bars",
        title: t,
        unit: s.unit ?? "",
        source: s.source ?? "",
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
      return {
        kind: "flow",
        title: t,
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
      return {
        kind: "split",
        title: t,
        left: { label: s.leftLabel ?? "A", items: s.items || [] },
        right: { label: s.rightLabel ?? "B", items: s.rightItems || [] },
      };
    case "pearl":
      return { kind: "pearl", title: t, text: s.text ?? s.subtitle ?? "", source: s.source ?? undefined };
    default:
      return { kind: "bullets", title: t || "Nota", bullets: s.items?.length ? s.items : [s.text || "Ver monografia"] };
  }
}

async function main() {
  const { createGatewayOpenAI, doutivaChatModel, doutivaOpenAIProviderOptions, requireAiApiKey } =
    await import("../src/lib/ai-provider.server.ts");
  requireAiApiKey();
  const openai = createGatewayOpenAI();

  let q = supabase.from("courses").select("id, slug").eq("published", true);
  if (courseArg) q = q.eq("slug", courseArg);
  const { data: courses } = await q;
  mkdirSync("/tmp/repair-course-slides", { recursive: true });

  for (const course of courses || []) {
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, position, title, monograph, slides, quick_ref")
      .eq("course_id", course.id)
      .eq("status", "published")
      .order("position");
    for (const L of lessons || []) {
      const n = Array.isArray(L.slides) ? L.slides.length : 0;
      if (n >= minSlides && (L.quick_ref || "").length > 300) {
        console.log(`skip ${course.slug}#${L.position} slides=${n}`);
        continue;
      }
      if (!(L.monograph || "").length) continue;
      console.log(`repair ${course.slug}#${L.position} was ${n}`);
      let slides = [];
      let quickRef = L.quick_ref || "";
      for (let attempt = 1; attempt <= 3 && slides.length < minSlides; attempt++) {
        try {
          const structured = streamText({
            model: doutivaChatModel(openai),
            system: `Designer instrucional médico Doutiva. Produza EXATAMENTE 10 slides + quick_ref a partir da monografia.
Kinds: title|bullets|bars|flow|table|split|pearl. Inclua table, flow, split, pearl. PT-BR. Tentativa ${attempt}.`,
            prompt: `Título: ${L.title}\n\n=== MONOGRAFIA ===\n${L.monograph}`,
            output: Output.object({ schema: outSchema }),
            providerOptions: doutivaOpenAIProviderOptions("medium"),
          });
          const o = await structured.output;
          slides = sanitize(o.slides.map(toSlide).filter(Boolean));
          quickRef = sanitize(o.quick_ref || quickRef);
          console.log(`  attempt ${attempt} → ${slides.length}`);
        } catch (e) {
          console.error(`  attempt ${attempt} fail`, e?.message || e);
        }
      }
      if (slides.length < 6) continue;
      await supabase
        .from("lessons")
        .update({ slides, quick_ref: quickRef, updated_at: new Date().toISOString() })
        .eq("id", L.id);
      writeFileSync(
        `/tmp/repair-course-slides/${course.slug}-${L.position}.json`,
        JSON.stringify({ slides, quick_ref: quickRef }, null, 2),
      );
      console.log(`repaired ${course.slug}#${L.position} → ${slides.length}`);
    }
  }
  console.log("REPAIR_ALL_DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
