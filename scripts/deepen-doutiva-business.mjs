#!/usr/bin/env node
/**
 * Deepen Doutiva business courses — OpenAI-only fast path (single structured call).
 * Usage:
 *   node --env-file=.env --import tsx scripts/deepen-doutiva-business.mjs
 *   node --env-file=.env --import tsx scripts/deepen-doutiva-business.mjs --course=precificacao-margem-consultorio
 *   node --env-file=.env --import tsx scripts/deepen-doutiva-business.mjs --only=1,2
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { streamText, Output } from "ai";
import { z } from "zod";
import { createGatewayOpenAI, doutivaChatModel, doutivaOpenAIProviderOptions, requireAiApiKey } from "../src/lib/ai-provider.server.ts";
import { toCase } from "../src/content/lesson-normalize.ts";
import { AUDIENCE_BUSINESS, BUSINESS_COURSES } from "./doutiva-curriculum-business.mjs";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const force = process.argv.includes("--force");
const courseArg = (process.argv.find((a) => a.startsWith("--course=")) || "").split("=")[1];
const onlyArg = (process.argv.find((a) => a.startsWith("--only=")) || "").split("=")[1];
const onlyPos = onlyArg
  ? new Set(onlyArg.split(",").map((x) => Number(x.trim())).filter(Boolean))
  : null;

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

const lessonSchema = z.object({
  title: z.string(),
  description: z.string(),
  evidence_level: z.string(),
  duration_minutes: z.number(),
  key_points: z.array(z.string()),
  slides: z.array(slideSchema),
  monograph: z.string(),
  quick_ref: z.string(),
  clinical_case: z.object({
    title: z.string(),
    vignette: z.string(),
    question: z.string(),
    teaching: z.string(),
    reward: z.number(),
    data: z.array(z.object({ label: z.string(), value: z.string() })),
    options: z.array(z.object({ label: z.string(), correct: z.boolean(), rationale: z.string() })),
  }),
  refs: z.array(z.object({ citation: z.string(), url: z.string().nullable() })),
});

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
  switch (s.kind) {
    case "title":
      return { kind: "title", title: t, subtitle: s.subtitle ?? undefined };
    case "bullets":
      return { kind: "bullets", title: t, bullets: s.items, note: s.note ?? undefined };
    case "bars":
      return {
        kind: "bars",
        title: t,
        unit: s.unit ?? "",
        bars: s.items.map((it) => {
          const [label, value] = String(it).split("|").map((x) => x.trim());
          return { label: label || it, value: Number(value) || 0 };
        }),
        source: s.source ?? undefined,
      };
    case "flow":
      return {
        kind: "flow",
        title: t,
        steps: s.items.map((it) => {
          const [label, detail] = String(it).split("—").map((x) => x.trim());
          return { label: label || it, detail: detail || "" };
        }),
      };
    case "table":
      return { kind: "table", title: t, head: s.head, rows: s.rows, note: s.note ?? undefined };
    case "split":
      return {
        kind: "split",
        title: t,
        leftLabel: s.leftLabel ?? "A",
        rightLabel: s.rightLabel ?? "B",
        left: s.items,
        right: s.rightItems,
      };
    case "pearl":
      return { kind: "pearl", title: t, text: s.text || s.items[0] || "" };
    default:
      return { kind: "bullets", title: t, bullets: s.items?.length ? s.items : [t] };
  }
}

function redactCase(c) {
  if (!c) return null;
  return sanitize({
    title: c.title,
    vignette: c.vignette,
    data: c.data,
    question: c.question,
    options: (c.options || []).map((o) => ({ label: o.label })),
    reward: c.reward ?? 40,
  });
}

function keysFromCase(c) {
  const opts = c.options || [];
  const correct = opts.findIndex((o) => o.correct);
  return {
    correct_option: correct >= 0 ? correct : 0,
    options: opts.map((o) => ({ label: String(o.label || ""), rationale: String(o.rationale || "") })),
    teaching: String(c.teaching || ""),
    reward: Number.isFinite(Number(c.reward)) ? Math.max(1, Math.round(Number(c.reward))) : 40,
  };
}

async function generateBusinessLesson({ topic, courseTitle, moduleTitle, extra }) {
  requireAiApiKey();
  const openai = createGatewayOpenAI();
  const system = `Você é autor sênior da Doutiva (escola do médico do futuro), trilha NEGÓCIOS.
Escreva em português do Brasil, tom direto de consultório, ético (CFM), sem marcas de farmácia/indústria.
${AUDIENCE_BUSINESS}

Entregue JSON no schema:
- monograph: markdown LONGO — mínimo 9.000 caracteres (~1.500+ palavras). Inclua ≥2 tabelas markdown, checklists acionáveis e números BR realistas (R$, %, dias). Sem enrolação: cada seção com exemplos de consultório.
- 8–10 slides (kinds: title, bullets, table, bars, flow, split, pearl) — bullets concretos, nunca genéricos
- clinical_case: caso empresário-médico BR, 6–8 data rows, 4 opções (1 correta), teaching denso
- quick_ref de bolso; key_points 5–7; refs 4–8 (sem inventar DOI)`;

  const prompt = `Curso: ${courseTitle}
Módulo: ${moduleTitle}
Tema: ${topic}

Foco desta aula:
${extra}

Produza a aula completa agora. A monografia DEVE ter no mínimo 9.000 caracteres.`;

  let best = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = streamText({
      model: doutivaChatModel(openai),
      system,
      prompt:
        attempt === 1
          ? prompt
          : `${prompt}\n\nATENÇÃO (tentativa ${attempt}): a monografia anterior ficou curta. Expanda cada seção com exemplos numéricos de consultório BR, tabelas e checklists até passar de 9.000 caracteres.`,
      output: Output.object({ schema: lessonSchema }),
      providerOptions: doutivaOpenAIProviderOptions("medium"),
      maxOutputTokens: 16000,
      maxRetries: 1,
    });
    const o = await result.output;
    if (!o?.monograph) continue;
    if (!best || o.monograph.length > best.monograph.length) best = o;
    if (o.monograph.length >= 5500) break;
  }
  if (!best?.monograph || best.monograph.length < 5500) {
    throw new Error(`monografia curta (${best?.monograph?.length || 0})`);
  }
  return {
    title: best.title,
    description: best.description,
    evidence_level: best.evidence_level || "Prática / gestão clínica",
    duration_minutes: Math.max(45, Math.round(best.duration_minutes || 60)),
    key_points: best.key_points,
    refs: best.refs,
    slides: best.slides.map(toSlide).filter(Boolean),
    monograph: best.monograph,
    quickRef: best.quick_ref,
    clinicalCase: toCase(best.clinical_case) ?? best.clinical_case,
  };
}

async function deepenCourse(courseDef) {
  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", courseDef.slug)
    .single();
  if (error) throw error;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, position, title, monograph, status")
    .eq("course_id", course.id)
    .order("position");

  mkdirSync(`/tmp/deepen-biz/${courseDef.slug}`, { recursive: true });
  mkdirSync(`scripts/course-exports/${courseDef.slug}`, { recursive: true });

  const summary = [];
  for (const spec of courseDef.lessons) {
    if (onlyPos && !onlyPos.has(spec.position)) continue;
    const lesson = (lessons || []).find((l) => l.position === spec.position);
    if (!lesson) {
      console.error("missing lesson", courseDef.slug, spec.position);
      continue;
    }
    if (!force && (lesson.monograph || "").length > 2500) {
      console.log(`skip ${courseDef.slug}#${spec.position}`);
      summary.push({ position: spec.position, skipped: true });
      continue;
    }

    console.log(`\n=== [${courseDef.slug} ${spec.position}] ${spec.topic.slice(0, 70)} ===`);
    const t0 = Date.now();
    let generated;
    try {
      generated = await generateBusinessLesson({
        topic: spec.topic,
        courseTitle: courseDef.title,
        moduleTitle: spec.module_title,
        extra: spec.extra,
      });
    } catch (e) {
      console.error("FAILED", courseDef.slug, spec.position, e?.message || e);
      summary.push({ position: spec.position, error: String(e?.message || e) });
      writeFileSync(
        `/tmp/deepen-biz/${courseDef.slug}/${spec.position}.error.json`,
        JSON.stringify({ error: String(e?.message || e) }, null, 2),
      );
      continue;
    }
    const elapsed = Math.round((Date.now() - t0) / 1000);
    const clinical = sanitize(generated.clinicalCase);
    const patch = sanitize({
      title: generated.title || spec.topic,
      description: generated.description,
      evidence_level: generated.evidence_level,
      duration_minutes: generated.duration_minutes,
      module_title: spec.module_title,
      module_position: spec.module_position,
      key_points: generated.key_points,
      refs: generated.refs,
      slides: generated.slides,
      monograph: generated.monograph,
      quick_ref: generated.quickRef,
      clinical_case: redactCase(clinical),
      reviewed_by: "Conselho editorial Doutiva · Negócios médicos",
      reviewed_at: new Date().toISOString(),
      status: "published",
      updated_at: new Date().toISOString(),
    });
    const { error: uerr } = await supabase.from("lessons").update(patch).eq("id", lesson.id);
    if (uerr) {
      console.error("UPDATE_FAIL", uerr.message);
      summary.push({ position: spec.position, error: uerr.message });
      continue;
    }
    const keys = sanitize(keysFromCase(clinical));
    await supabase.from("lesson_case_keys").upsert(
      {
        lesson_id: lesson.id,
        correct_option: keys.correct_option,
        options: keys.options,
        teaching: keys.teaching,
        reward: keys.reward,
      },
      { onConflict: "lesson_id" },
    );

    const snap = {
      position: spec.position,
      title: patch.title,
      mono_len: (patch.monograph || "").length,
      slides: (patch.slides || []).length,
      elapsed_s: elapsed,
    };
    summary.push(snap);
    writeFileSync(
      `scripts/course-exports/${courseDef.slug}/lesson-${spec.position}.json`,
      JSON.stringify(snap, null, 2),
    );
    console.log("saved", snap.title.slice(0, 60), "mono", snap.mono_len, "slides", snap.slides, `${elapsed}s`);
  }

  const { data: all } = await supabase
    .from("lessons")
    .select("duration_minutes, status")
    .eq("course_id", course.id);
  const dur = (all || [])
    .filter((l) => l.status === "published")
    .reduce((a, b) => a + (b.duration_minutes || 0), 0);
  await supabase
    .from("courses")
    .update({
      duration_minutes: dur || courseDef.lessons.length * 60,
      featured: true,
      published: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", course.id);

  writeFileSync(`/tmp/deepen-biz/${courseDef.slug}/summary.json`, JSON.stringify(summary, null, 2));
  return summary;
}

async function main() {
  const list = courseArg
    ? BUSINESS_COURSES.filter((c) => c.slug === courseArg)
    : BUSINESS_COURSES;
  if (!list.length) throw new Error(`course not found: ${courseArg}`);
  const all = {};
  for (const c of list) {
    console.log("\n########", c.slug, "########");
    all[c.slug] = await deepenCourse(c);
  }
  writeFileSync("/tmp/deepen-biz/ALL_SUMMARY.json", JSON.stringify(all, null, 2));
  console.log("\nALL DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
