// Tipos calcados de los contratos de los webhooks n8n v2.

export interface CategoriaDetalle {
  total: number;
  cubiertos: number;
  coberturaPct: number;
  peso: number;
}

// Requisito extraido de la oferta; el frontend lo reenvia al recalcular
// para que la lista no cambie entre recalculos.
export interface RequisitoOferta {
  texto: string;
  categoria: string;
}

export interface MatchResult {
  matchScore: number;
  requisitos?: RequisitoOferta[];
  porCategoria: Record<string, CategoriaDetalle>;
  cubre: string[];
  noCubre: string[];
  // Meta de la oferta, extraida por el motor (para prefiltrar el registro en el tracker).
  empresa?: string;
  puesto?: string;
  sector?: string;
}

// ===== CV Harvard (lo que devuelve mono-cv-adaptado) =====
export interface BulletCv {
  texto: string;
  origen: string[]; // hechos literales que respaldan el bullet
}

export interface BloqueCv {
  empresa?: string;
  puesto?: string;
  ubicacion?: string;
  fechas?: string;
  bullets?: BulletCv[];
}

export interface GrupoHabilidades {
  categoria: string;
  items: string[];
}

export interface SeccionCv {
  tipo: "experiencia" | "habilidades" | "educacion" | "certificaciones" | "otros";
  titulo: string;
  bloques?: BloqueCv[];
  grupos?: GrupoHabilidades[];
  bullets?: BulletCv[];
}

export interface CvAdaptado {
  perfil: string;
  perfil_origen: string[];
  secciones: SeccionCv[];
}

// Datos de cabecera del CV (no pasan por la IA: vienen de tu cuenta).
export interface ContactoCv {
  nombre: string;
  email?: string;
  ciudad?: string;
  telefono?: string;
  linkedin?: string;
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
