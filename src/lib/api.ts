import type { CvAdaptado, MatchResult, Postulacion } from "@/lib/types";

// Unico punto de contacto con el motor n8n. Los paths v2 son exclusivos de
// jano-web: los flujos v1 del PoC no se tocan.
const BASE = "https://samtho.app.n8n.cloud/webhook";

const PATHS = {
  ingestCv: "/v2-ingest-cv",
  matchOferta: "/v2-match-oferta",
  guardarHueco: "/v2-guardar-hueco",
  cvAdaptado: "/v2-cv-adaptado",
  ofertaDesdeUrl: "/v2-oferta-url",
  postulaciones: "/v2-postulaciones",
  postulacionesAlta: "/v2-postulaciones-alta",
} as const;

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detalle || data.error || data.message || `Error ${res.status}`);
  }
  return data as T;
}

export function ingestCv(cvId: string, textoCV: string) {
  return post<{ ok: boolean; guardados: number }>(PATHS.ingestCv, { cvId, textoCV });
}

export function matchOferta(cvId: string, ofertaTexto: string) {
  return post<MatchResult>(PATHS.matchOferta, { cvId, oferta_texto: ofertaTexto });
}

export function guardarHueco(cvId: string, requisito: string, respuesta: string) {
  return post<{ ok: boolean }>(PATHS.guardarHueco, { cvId, requisito, respuesta });
}

export function cvAdaptado(cvId: string, ofertaTexto: string) {
  return post<CvAdaptado>(PATHS.cvAdaptado, { cvId, oferta_texto: ofertaTexto });
}

export function ofertaDesdeUrl(url: string) {
  return post<{ oferta_texto: string }>(PATHS.ofertaDesdeUrl, { url });
}

export async function getPostulaciones(): Promise<Postulacion[]> {
  const res = await fetch(`${BASE}${PATHS.postulaciones}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function addPostulacion(p: {
  empresa: string;
  puesto: string;
  sector: string;
  match_score: number;
  salario: string;
  cv_id: string;
  url_oferta?: string;
}) {
  return post<{ ok: boolean; id: string }>(PATHS.postulacionesAlta, p);
}
