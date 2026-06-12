import type { CvAdaptado, MatchResult, Postulacion, RequisitoOferta } from "@/lib/types";
import { supabase } from "@/lib/supabase";

// Unico punto de contacto con el motor n8n. Apuntado al workflow UNICO
// "Jano - Todo en uno" (paths mono-*). Para volver a los flujos separados v2,
// cambiar el prefijo mono- por v2- en todos los paths de abajo.
const BASE = "https://samtho.app.n8n.cloud/webhook";

const PATHS = {
  ingestCv: "/mono-ingest-cv",
  matchOferta: "/mono-match-oferta",
  guardarHueco: "/mono-guardar-hueco",
  cvAdaptado: "/mono-cv-adaptado",
  ofertaDesdeUrl: "/mono-oferta-url",
  mejorarBullet: "/mono-mejorar-bullet",
  postulaciones: "/mono-postulaciones",
  postulacionesAlta: "/mono-postulaciones-alta",
} as const;

// Toda llamada al motor viaja con el token de sesion de Supabase: n8n lo
// valida contra Supabase Auth y comprueba que el cvId pertenece al usuario.
async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// POST con un reintento automatico ante fallo de red o 5xx (a prueba de demo).
async function post<T>(path: string, body: unknown, intento = 1): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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

// Si se pasa el match previo (recalculo desde huecos), se reenvian sus requisitos:
// el motor se salta la re-extraccion y la lista de huecos queda estable y comparable.
export function matchOferta(cvId: string, ofertaTexto: string, previo?: MatchResult | null) {
  const requisitos: RequisitoOferta[] = previo?.requisitos ?? [];
  return post<MatchResult>(PATHS.matchOferta, {
    cvId,
    oferta_texto: ofertaTexto,
    ...(requisitos.length
      ? { requisitos, empresa: previo?.empresa ?? "", puesto: previo?.puesto ?? "", sector: previo?.sector ?? "" }
      : {}),
  });
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

// El tracker es personal: n8n deriva los CVs del usuario desde su token
// (tabla user_cvs via RLS), el cliente ya no manda cvIds.
export async function getPostulaciones(): Promise<Postulacion[]> {
  const res = await fetch(`${BASE}${PATHS.postulaciones}`, { headers: await authHeaders() });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const data = await res.json();
  // El motor emite [{}] cuando no hay filas: filtrar objetos sin id.
  return Array.isArray(data) ? data.filter((r) => r && r.id) : [];
}

export function updatePostulacion(p: {
  id: string;
  estado?: string;
  sector?: string;
  salario?: string;
}) {
  return post<{ ok: boolean }>("/mono-postulaciones-update", p);
}

export function deletePostulacion(p: { id: string }) {
  return post<{ ok: boolean }>("/mono-postulaciones-borrar", p);
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
