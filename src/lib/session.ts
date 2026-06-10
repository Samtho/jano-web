// Identidad y estado por navegador (localStorage). Cada visitante tiene su
// propio cvId: mejora real sobre el PoC, que usaba un cvId fijo compartido.
// Leer SOLO en handlers o useEffect (nunca en render: el prerender es estatico).

const KEYS = {
  cvId: "jano.cvId",
  cvTexto: "jano.cvTexto",
  cvGuardado: "jano.cvGuardado",
  ofertaTexto: "jano.ofertaTexto",
  lastMatch: "jano.lastMatch",
} as const;

export function getCvId(): string {
  let id = localStorage.getItem(KEYS.cvId);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEYS.cvId, id);
  }
  return id;
}

// Cambia el CV activo (al elegir uno guardado de la cuenta).
export function setActiveCvId(id: string) {
  localStorage.setItem(KEYS.cvId, id);
}

// Genera y activa un cvId nuevo (al subir un CV nuevo).
export function newCvId(): string {
  const id = crypto.randomUUID();
  localStorage.setItem(KEYS.cvId, id);
  return id;
}

export function loadSession() {
  return {
    cvTexto: localStorage.getItem(KEYS.cvTexto) ?? "",
    cvGuardado: localStorage.getItem(KEYS.cvGuardado) === "1",
    ofertaTexto: localStorage.getItem(KEYS.ofertaTexto) ?? "",
  };
}

export function saveCv(texto: string, guardado: boolean) {
  localStorage.setItem(KEYS.cvTexto, texto);
  localStorage.setItem(KEYS.cvGuardado, guardado ? "1" : "0");
}

export function saveOferta(texto: string) {
  localStorage.setItem(KEYS.ofertaTexto, texto);
}
