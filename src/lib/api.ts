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
  mejorarBullet: "/v2-mejorar-bullet",
  postulaciones: "/v2-postulaciones",
  postulacionesAlta: "/v2-postulaciones-alta",
} as const;

// POST con un reintento automatico ante fallo de red o 5xx (a prueba de demo).
async function post<T>(path: string, body: unknown, intento = 1): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status >= 500 && intento === 1) {
      await new Promise((r) => setTimeout(r, 700));
      return post<T>(path, body, 2);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detalle || data.error || data.message || `Error ${res.status}`);
    }
    return data as T;
  } catch (e) {
    if (intento === 1 && e instanceof TypeError) {
      // Fallo de red: un solo reintento con pausa corta.
      await new Promise((r) => setTimeout(r, 700));
      return post<T>(path, body, 2);
    }
    throw e;
  }
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
  return post<{ oferta_texto: string; titulo?: string; empresa?: string }>(PATHS.ofertaDesdeUrl, { url });
}

export function mejorarBullet(texto: string, origen: string, ofertaTexto: string) {
  return post<{ alternativas: string[] }>(PATHS.mejorarBullet, {
    texto,
    origen,
    oferta_texto: ofertaTexto,
  });
}

export async function getPostulaciones(): Promise<Postulacion[]> {
  const res = await fetch(`${BASE}${PATHS.postulaciones}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function updatePostulacion(p: { id: string; estado?: string; sector?: string; salario?: string }) {
  return post<{ ok: boolean }>("/v2-postulaciones-update", p);
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
