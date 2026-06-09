// Tipos calcados de los contratos de los webhooks n8n v2.

export interface CategoriaDetalle {
  total: number;
  cubiertos: number;
  coberturaPct: number;
  peso: number;
}

export interface MatchResult {
  matchScore: number;
  porCategoria: Record<string, CategoriaDetalle>;
  cubre: string[];
  noCubre: string[];
}

export interface BulletCv {
  texto: string;
  origen: string;
}

export interface SeccionCv {
  titulo: string;
  bullets: BulletCv[];
}

export interface CvAdaptado {
  secciones: SeccionCv[];
}

export type EstadoPostulacion = "enviada" | "entrevista" | "oferta" | "rechazo" | "sin_respuesta";

export interface Postulacion {
  id: string;
  fecha: string;
  empresa: string;
  puesto: string | null;
  sector: string | null;
  match_score: number | null;
  salario: string | null;
  estado: EstadoPostulacion | string;
}
