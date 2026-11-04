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
