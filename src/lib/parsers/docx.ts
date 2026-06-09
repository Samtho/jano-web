// Extrae el texto de un .docx en el navegador con mammoth.
export async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return value.trim();
}
