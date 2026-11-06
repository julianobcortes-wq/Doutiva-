import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type Ctx = { supabase: any; userId: string };
async function assertAdmin({ supabase, userId }: Ctx) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Acesso restrito ao corpo docente Doutiva.");
}

export type SourceHit = {
  source_type: "pubmed" | "trial";
  external_id: string;
  title: string;
  authors: string | null;
  journal: string | null;
  year: number | null;
  doi: string | null;
  url: string;
  study_design: string | null;
  evidence_level: string | null;
  abstract: string | null;
  open_access: boolean;
  pmcid: string | null;
  citations: number | null;
};

function evidenceFor(design: string): string {
  const d = design.toLowerCase();
  if (d.includes("meta-analysis") || d.includes("systematic review")) return "A";
  if (d.includes("randomized") || d.includes("phase 3") || d.includes("phase3")) return "A";
  if (d.includes("guideline") || d.includes("consensus")) return "A";
  if (
    d.includes("phase 2") ||
    d.includes("phase2") ||
    d.includes("cohort") ||
    d.includes("observational")
  )
    return "B";
  if (d.includes("case") || d.includes("phase 1") || d.includes("phase1")) return "C";
  return "—";
}

const strip = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function searchEuropePmc(q: string, highEvidence: boolean): Promise<SourceHit[]> {
  const filter = highEvidence
    ? ` AND (PUB_TYPE:"randomized controlled trial" OR PUB_TYPE:"meta-analysis" OR PUB_TYPE:"systematic review" OR PUB_TYPE:"practice guideline" OR PUB_TYPE:"clinical trial, phase iii")`
    : "";
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(`(${q})${filter} AND SRC:MED`)}&format=json&resultType=core&pageSize=25&sort=${encodeURIComponent("CITED desc")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PubMed indisponível (${res.status}).`);
  const j = (await res.json()) as { resultList?: { result?: any[] } };
  return (j.resultList?.result ?? []).map((r) => {
    const types: string[] = r.pubTypeList?.pubType ?? [];
    const design =
      types.filter((t) => !/journal article|research support/i.test(t)).join(", ") || "Artigo";
    return {
      source_type: "pubmed",
      external_id: String(r.pmid ?? r.id),
      title: strip(r.title ?? ""),
      authors: r.authorString ?? null,
      journal: r.journalInfo?.journal?.isoabbreviation ?? r.journalInfo?.journal?.title ?? null,
      year: r.pubYear ? Number(r.pubYear) : null,
      doi: r.doi ?? null,
      url: r.pmid
        ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`
        : `https://europepmc.org/article/MED/${r.id}`,
      study_design: design,
      evidence_level: evidenceFor(design),
      abstract: r.abstractText ? strip(r.abstractText) : null,
      open_access: r.isOpenAccess === "Y",
      pmcid: r.pmcid ?? null,
      citations: typeof r.citedByCount === "number" ? r.citedByCount : null,
    } satisfies SourceHit;
  });
}

async function searchTrials(q: string): Promise<SourceHit[]> {
  const url = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(q)}&pageSize=20&sort=${encodeURIComponent("EnrollmentCount:desc")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ClinicalTrials.gov indisponível (${res.status}).`);
  const j = (await res.json()) as { studies?: any[] };
  return (j.studies ?? []).map((s) => {
    const p = s.protocolSection ?? {};
    const id = p.identificationModule ?? {};
    const design = p.designModule ?? {};
    const phases: string[] = design.phases ?? [];
    const studyDesign = [design.studyType, phases.join("/"), design.designInfo?.allocation]
      .filter(Boolean)
      .join(" · ");
    const status = p.statusModule?.overallStatus ?? "";
    const outcomes = (p.outcomesModule?.primaryOutcomes ?? [])
      .map((o: any) => `- ${o.measure} (${o.timeFrame ?? ""})`)
      .join("\n");
    const summary = [
      p.descriptionModule?.briefSummary,
      `Status: ${status}. Participantes: ${design.enrollmentInfo?.count ?? "?"}. Patrocinador: ${p.sponsorCollaboratorsModule?.leadSponsor?.name ?? "?"}.`,
      outcomes ? `Desfechos primários:\n${outcomes}` : "",
      s.hasResults ? "Resultados publicados no registro." : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    return {
      source_type: "trial",
      external_id: id.nctId,
      title: `${id.acronym ? id.acronym + " — " : ""}${id.briefTitle ?? id.nctId}`,
      authors: p.sponsorCollaboratorsModule?.leadSponsor?.name ?? null,
      journal: "ClinicalTrials.gov",
      year: p.statusModule?.startDateStruct?.date
        ? Number(String(p.statusModule.startDateStruct.date).slice(0, 4))
        : null,
      doi: null,
      url: `https://clinicaltrials.gov/study/${id.nctId}`,
      study_design: studyDesign || "Ensaio clínico",
      evidence_level: evidenceFor(
        `${phases.join(" ")} ${design.designInfo?.allocation ?? ""}`
          .replace("RANDOMIZED", "randomized")
          .replace("PHASE3", "phase 3")
          .replace("PHASE2", "phase 2")
          .replace("PHASE1", "phase 1"),
      ),
      abstract: summary,
      open_access: true,
      pmcid: null,
      citations: null,
    } satisfies SourceHit;
  });
}

async function fetchOpenFullText(pmcid: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.ebi.ac.uk/europepmc/webservices/rest/${pmcid}/fullTextXML`,
    );
    if (!res.ok) return null;
    const xml = await res.text();
    const body = xml.match(/<body[\s\S]*<\/body>/i)?.[0] ?? xml;
    const text = body
      .replace(/<title>([\s\S]*?)<\/title>/g, "\n\n## $1\n")
      .replace(/<\/p>/g, "\n\n")
      .replace(/<xref[^>]*>[\s\S]*?<\/xref>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s+/g, "\n")
      .trim();
    return text.slice(0, 120000);
  } catch {
    return null;
  }
}

export const librarySearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { query: string; base: "pubmed" | "trials"; highEvidence: boolean }) =>
    z
      .object({
        query: z.string().min(2).max(300),
        base: z.enum(["pubmed", "trials"]),
        highEvidence: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    try {
      const hits =
        data.base === "pubmed"
          ? await searchEuropePmc(data.query, data.highEvidence)
          : await searchTrials(data.query);
      const ids = hits.map((h) => h.external_id);
      const { data: existing } = await context.supabase
        .from("knowledge_sources")
        .select("external_id")
        .in("external_id", ids.length ? ids : ["-"]);
      const have = new Set(
        (existing ?? []).map((e: { external_id: string | null }) => e.external_id),
      );
      return {
        hits: hits.map((h) => ({ ...h, inLibrary: have.has(h.external_id) })),
        error: null as string | null,
      };
    } catch (e) {
      console.error("librarySearch", e);
      return { hits: [], error: e instanceof Error ? e.message : "Falha na busca." };
    }
  });

const hitSchema = z.object({
  source_type: z.enum(["pubmed", "trial"]),
  external_id: z.string(),
  title: z.string(),
  authors: z.string().nullable(),
  journal: z.string().nullable(),
  year: z.number().nullable(),
  doi: z.string().nullable(),
  url: z.string(),
  study_design: z.string().nullable(),
  evidence_level: z.string().nullable(),
  abstract: z.string().nullable(),
  pmcid: z.string().nullable(),
  tags: z.array(z.string()).max(20),
});

export const libraryImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof hitSchema>) => hitSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const full_text = data.pmcid ? await fetchOpenFullText(data.pmcid) : null;
    const { pmcid: _p, ...row } = data;
    const { error } = await context.supabase
      .from("knowledge_sources")
      .upsert(
        { ...row, full_text, added_by: context.userId, updated_at: new Date().toISOString() },
        { onConflict: "source_type,external_id" },
      );
    if (error) throw new Error(error.message);
    let embedded = 0;
    try {
      embedded = await (await import("./embeddings.server")).embedPendingSources();
    } catch (e) {
      console.error("embedPendingSources", e);
    }
    return { ok: true, fullText: !!full_text, embedded };
  });

const manualSchema = z.object({
  id: z.string().uuid().optional(),
  source_type: z.enum(["guideline", "pdf", "manual", "label"]),
  title: z.string().min(2).max(500),
  authors: z.string().max(1000).nullable(),
  journal: z.string().max(300).nullable(),
  year: z.number().int().min(1900).max(2100).nullable(),
  doi: z.string().max(200).nullable(),
  url: z.string().max(1000).nullable(),
  study_design: z.string().max(200).nullable(),
  evidence_level: z.string().max(10).nullable(),
  abstract: z.string().max(20000).nullable(),
  full_text: z.string().max(400000).nullable(),
  tags: z.array(z.string()).max(20),
  notes: z.string().max(4000).nullable(),
});

export const librarySaveManual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof manualSchema>) => manualSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { id, ...row } = data;
    const q = id
      ? context.supabase
          .from("knowledge_sources")
          .update({ ...row, updated_at: new Date().toISOString() })
          .eq("id", id)
      : context.supabase.from("knowledge_sources").insert({ ...row, added_by: context.userId });
    const { error } = await q;
    if (error) throw new Error(error.message);
    await (await import("./embeddings.server")).embedPendingSources().catch(() => 0);
    return { ok: true };
  });

export const libraryList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("knowledge_sources")
      .select(
        "id, source_type, external_id, title, authors, journal, year, doi, url, study_design, evidence_level, tags, created_at, abstract, full_text",
      )
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return (data ?? []).map((s: any) => ({
      ...s,
      abstract: s.abstract ? String(s.abstract).slice(0, 600) : null,
      full_text: undefined,
      hasFullText: !!s.full_text,
      words: s.full_text ? String(s.full_text).split(/\s+/).length : 0,
    })) as Array<{
      id: string;
      source_type: string;
      external_id: string | null;
      title: string;
      authors: string | null;
      journal: string | null;
      year: number | null;
      doi: string | null;
      url: string | null;
      study_design: string | null;
      evidence_level: string | null;
      tags: string[];
      created_at: string;
      abstract: string | null;
      hasFullText: boolean;
      words: number;
    }>;
  });

export const libraryDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("knowledge_sources").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** New RCTs, meta-analyses and guidelines (last 180 days) on the themes of published lessons. */
export const evidenceAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as Ctx);
    const { data: lessons } = await context.supabase
      .from("lessons")
      .select("id, title")
      .eq("status", "published")
      .limit(12);
    const since = new Date(Date.now() - 180 * 86_400_000).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    const out = await Promise.all(
      (lessons ?? []).map(async (l: { id: string; title: string }) => {
        const words = l.title
          .replace(/[^\p{L}\p{N}\s-]/gu, " ")
          .split(/\s+/)
          .filter((w) => w.length > 3)
          .slice(0, 4);
        if (!words.length)
          return {
            lessonId: l.id,
            lesson: l.title,
            hits: [] as { title: string; url: string; date: string; type: string }[],
          };
        const q = `(${words.join(" AND ")}) AND (PUB_TYPE:"Randomized Controlled Trial" OR PUB_TYPE:"Meta-Analysis" OR PUB_TYPE:"Practice Guideline") AND FIRST_PDATE:[${since} TO ${today}] AND SRC:MED`;
        try {
          const r = await fetch(
            `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(q)}&format=json&pageSize=3&sort=${encodeURIComponent("P_PDATE_D desc")}`,
          );
          const j = (await r.json()) as { resultList?: { result?: any[] } };
          return {
            lessonId: l.id,
            lesson: l.title,
            hits: (j.resultList?.result ?? []).map((x) => ({
              title: strip(x.title ?? ""),
              date: x.firstPublicationDate ?? "",
              type: x.pubType ?? "",
              url: x.pmid
                ? `https://pubmed.ncbi.nlm.nih.gov/${x.pmid}/`
                : `https://europepmc.org/article/MED/${x.id}`,
            })),
          };
        } catch {
          return { lessonId: l.id, lesson: l.title, hits: [] };
        }
      }),
    );
    return out.filter((o) => o.hits.length);
  });
