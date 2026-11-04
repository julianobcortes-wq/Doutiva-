/** Checks that every [n] / [S n] cited in the text points to an existing reference, and flags references never cited. */
export function checkCitations(text: string, refCount: number) {
  const cited = new Set<number>();
  for (const m of text.matchAll(/\[S?(\d{1,3})(?:\s*[,–-]\s*S?(\d{1,3}))*\]/g)) {
    for (const n of m[0].match(/\d+/g) ?? []) cited.add(Number(n));
  }
  const broken = [...cited].filter((n) => n < 1 || n > refCount).sort((a, b) => a - b);
  const uncited: number[] = [];
  for (let i = 1; i <= refCount; i++) if (!cited.has(i)) uncited.push(i);
  return { cited: cited.size, broken, uncited };
}

const CITE_TOKEN = /\[S?(\d{1,3})(?:\s*[,–-]\s*S?(\d{1,3}))*\]/g;

/**
 * Enforces that tutor/library citations stay inside the retrieved corpus [S1..Sn].
 * Broken markers are removed; a short integrity note is appended when anything was stripped.
 * When refCount is 0, any [S#]/[n] library-style cite is stripped (no corpus was injected).
 */
export function gateCorpusCitations(text: string, refCount: number) {
  const audit = checkCitations(text, refCount);
  let gated = text;
  if (refCount <= 0) {
    gated = text
      .replace(CITE_TOKEN, "")
      .replace(/[ \t]+\n/g, "\n")
      .trimEnd();
    const stripped = gated !== text.trimEnd();
    if (stripped) {
      gated +=
        "\n\n---\n*Aviso de evidência: nenhuma fonte do acervo Doutiva cobria esta pergunta; marcações de citação inventadas foram removidas.*";
    }
    return { text: gated, ...audit, stripped };
  }

  gated = text.replace(CITE_TOKEN, (token) => {
    const nums = [...token.matchAll(/\d+/g)].map((m) => Number(m[0]));
    const valid = nums.filter((n) => n >= 1 && n <= refCount);
    if (valid.length === nums.length) return token;
    if (!valid.length) return "";
    return `[${valid.map((n) => `S${n}`).join(", ")}]`;
  });
  // Clean doubled spaces left by removals inside a line
  gated = gated.replace(/[^\S\n]{2,}/g, " ").replace(/ \n/g, "\n");

  const stripped = audit.broken.length > 0;
  if (stripped) {
    gated += `\n\n---\n*Aviso de evidência: citações fora do acervo recuperado (S${audit.broken.join(", S")}) foram removidas ou ajustadas. Confira as fontes S1–S${refCount} listadas.*`;
  }
  const fidelity = scoreCitationFidelity(gated, []);
  return { text: gated, ...audit, stripped, fidelity };
}

/** Rough claim↔excerpt overlap for cited [S#] tokens against retrieved excerpts. */
export function scoreCitationFidelity(
  text: string,
  corpus: { excerpt: string }[],
): { checked: number; weak: number; notes: string[] } {
  if (!corpus.length) return { checked: 0, weak: 0, notes: [] };
  const notes: string[] = [];
  let checked = 0;
  let weak = 0;
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => /\[S\d{1,3}\]/.test(s));
  for (const sentence of sentences) {
    const nums = [...sentence.matchAll(/\[S(\d{1,3})\]/g)].map((m) => Number(m[1]));
    for (const n of nums) {
      const excerpt = corpus[n - 1]?.excerpt ?? "";
      if (!excerpt) continue;
      checked++;
      const overlap = tokenOverlap(sentence, excerpt);
      if (overlap < 0.08) {
        weak++;
        notes.push(`S${n}`);
      }
    }
  }
  return { checked, weak, notes: [...new Set(notes)] };
}

function tokenOverlap(a: string, b: string) {
  const ta = new Set(
    a
      .toLowerCase()
      .replace(/\[s\d+\]/g, " ")
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 3),
  );
  const tb = new Set(
    b
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 3),
  );
  if (!ta.size || !tb.size) return 0;
  let hit = 0;
  for (const w of ta) if (tb.has(w)) hit++;
  return hit / ta.size;
}

/** Gate citations then append fidelity warning when claim↔excerpt overlap is weak. */
export function gateCorpusCitationsWithFidelity(
  text: string,
  refCount: number,
  corpus: { excerpt: string }[],
) {
  const gated = gateCorpusCitations(text, refCount);
  const fidelity = scoreCitationFidelity(gated.text, corpus);
  let out = gated.text;
  if (fidelity.weak > 0) {
    out += `\n\n---\n*Aviso de fidelidade: ${fidelity.weak} citação(ões) (${fidelity.notes.map((n) => n).join(", ")}) têm baixa sobreposição lexical com o trecho recuperado — confira a fonte antes de aplicar clinicamente.*`;
  }
  return { ...gated, text: out, fidelity };
}
