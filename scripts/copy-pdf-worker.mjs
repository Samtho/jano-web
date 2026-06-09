// Copia el worker de pdfjs a public/ para servirlo estatico con la MISMA
// version que la API (evita el desajuste tipico API/worker del CDN).
import { copyFileSync, mkdirSync, existsSync } from "node:fs";

const src = "node_modules/pdfjs-dist/build/pdf.worker.min.mjs";
if (existsSync(src)) {
  mkdirSync("public", { recursive: true });
  copyFileSync(src, "public/pdf.worker.min.mjs");
  console.log("pdf.worker.min.mjs copiado a public/");
} else {
  console.warn("pdfjs-dist no instalado todavia; se omite la copia del worker");
}
