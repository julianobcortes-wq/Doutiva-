// Semantic search for the Scientific Library (Lovable AI embeddings + pgvector).
const MODEL = "google/gemini-embedding-2";

export async function embedTexts(texts: string[]): Promise<number[][] | null> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey || !texts.length) return null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, input: texts }),
    });
    if (res.ok) {
      const json = (await res.json()) as { data: { index: number; embedding: number[] }[] };
      const out: number[][] = [];
      for (const d of json.data) out[d.index] = d.embedding;
      return out.length === texts.length && out.every((v) => v?.length) ? out : null;
    }
    if (!(res.status === 429 || res.status >= 500)) return null;
    await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
  }
  return null;
}

export function sourceText(s: { title: string; abstract: string | null; full_text: string | null; tags: string[] | null }) {
  return [s.title, (s.tags ?? []).join(", "), s.abstract ?? "", (s.full_text ?? "").slice(0, 6000)].join("\n").slice(0, 8000);
}

/** Embeds library sources that don't have a vector yet (new or edited). */
export async function embedPendingSources(max = 16) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("knowledge_sources")
    .select("id,title,abstract,full_text,tags")
    .is("embedding", null)
    .limit(max);
  if (!data?.length) return 0;
  const vecs = await embedTexts(data.map(sourceText));
  if (!vecs) return 0;
  await Promise.all(
    data.map((s, i) =>
      supabaseAdmin.from("knowledge_sources").update({ embedding: JSON.stringify(vecs[i]) }).eq("id", s.id),
    ),
  );
  return data.length;
}
