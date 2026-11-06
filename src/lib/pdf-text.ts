// Browser-only: extract plain text from a PDF file. Dynamically imported.
export async function extractPdfText(file: File, onProgress?: (p: number) => void): Promise<{ text: string; pages: number }> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const c = await page.getTextContent();
    parts.push(c.items.map((it) => ("str" in it ? it.str : "")).join(" "));
    onProgress?.(i / doc.numPages);
  }
  return { text: parts.join("\n\n").replace(/[ \t]+/g, " ").trim(), pages: doc.numPages };
}
