/**
 * Repair treatise/markdown that was saved with newlines stripped between blocks.
 * Keeps already-valid markdown intact.
 */
export function normalizeMarkdown(src: string): string {
  if (!src) return "";
  let s = src.replace(/\r\n/g, "\n");

  // Literal "\n" sequences (escaped) with almost no real newlines
  if (s.includes("\\n") && (s.match(/\n/g)?.length ?? 0) < 5) {
    s = s.replace(/\\n/g, "\n");
  }

  // Horizontal rules jammed against prose: "texto --- ###"
  s = s.replace(/([^\n])[ \t]*---[ \t]*(?=\S)/g, "$1\n\n---\n\n");

  // ATX headings jammed after prose / punctuation / closing emphasis
  s = s.replace(/([^\n#])[ \t]+(#{1,6}[ \t]+\S)/g, "$1\n\n$2");
  s = s.replace(/([.!?:;*_\)\]])(#{1,6}[ \t]+\S)/g, "$1\n\n$2");

  // Pipe tables jammed after prose
  s = s.replace(/([^\n|])[ \t]+(\|[^\n]+\|)/g, "$1\n\n$2");

  // Ensure blank line before list markers after prose (never after heading hashes)
  s = s.replace(/([^\n#\-*+])[ \t]+([-*+][ \t]+\S)/g, "$1\n\n$2");
  s = s.replace(/([^\n#\d])[ \t]+(\d+\.[ \t]+\S)/g, "$1\n\n$2");

  // Repair accidental split of "### 1. Title" → "###\n\n1. Title"
  s = s.replace(/(#{1,6})\n+\s*(\d+\.[ \t]+\S)/g, "$1 $2");

  // Collapse 3+ blank lines
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim() + "\n";
}
