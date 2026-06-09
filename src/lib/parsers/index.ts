import { extractPdfText } from "./pdf";
import { extractDocxText } from "./docx";

const MIN_CHARS = 50;

// Extrae texto de un archivo de CV segun su extension.
// Lanza errores con mensajes pensados para mostrarse tal cual al usuario.
export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  let texto = "";

  if (ext === "pdf") {
    texto = await extractPdfText(file);
  } else if (ext === "docx") {
    texto = await extractDocxText(file);
  } else if (ext === "txt" || ext === "md") {
    texto = (await file.text()).trim();
  } else if (ext === "doc") {
    throw new Error("El formato .doc antiguo no esta soportado. Guarda el archivo como .docx o pega el texto.");
  } else {
    throw new Error(`No se reconoce el formato .${ext}. Sube un PDF, DOCX o TXT, o pega el texto.`);
  }

  if (texto.length < MIN_CHARS) {
    throw new Error(
      "No pude extraer texto de este archivo (puede ser un PDF escaneado). Pega el texto del CV a mano."
    );
  }
  return texto;
}
