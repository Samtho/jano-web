import { BASE_PATH } from "@/lib/basePath";

// Extrae el texto de un PDF en el navegador con pdfjs.
// Import dinamico: pdfjs solo se descarga si el usuario sube un PDF.
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `${BASE_PATH}/pdf.worker.min.mjs`;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    pages.push(content.items.map((it) => ("str" in it ? it.str : "")).join(" "));
  }
  return pages.join("\n\n").trim();
}
