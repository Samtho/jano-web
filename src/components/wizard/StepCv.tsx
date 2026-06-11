"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import FileDrop from "@/components/ui/FileDrop";
import Pill from "@/components/ui/Pill";
import ProcessLoader from "@/components/ui/ProcessLoader";
import { useToast } from "@/components/ui/Toast";
import { extractTextFromFile } from "@/lib/parsers";
import { getCvId } from "@/lib/session";
import type { SavedCv } from "@/lib/cvs";

const STAGES_INGESTA = [
  "Leyendo tu CV",
  "Extrayendo hechos con su origen",
  "Vectorizando cada hecho (embeddings)",
  "Guardando tu base de hechos",
];

type Props = {
  texto: string;
  onTexto: (t: string) => void;
  nombre: string;
  onNombre: (n: string) => void;
  savedCvs: SavedCv[] | null;
  onUsar: (cvId: string, nombre: string) => void;
  busy: boolean;
  onGuardarNuevo: () => void;
  onArchivo: (f: File) => void;
};

export default function StepCv({ texto, onTexto, nombre, onNombre, savedCvs, onUsar, busy, onGuardarNuevo, onArchivo }: Props) {
  const toast = useToast();
  const [parsing, setParsing] = useState(false);
  const [modo, setModo] = useState<"elegir" | "nuevo">("nuevo");
  const [modoTocado, setModoTocado] = useState(false);
  const [activoCvId, setActivoCvId] = useState("");
  const tieneCvs = (savedCvs?.length ?? 0) > 0;

  useEffect(() => {
    setActivoCvId(getCvId());
  }, []);

  // Si hay CVs guardados y el usuario no ha tocado las pestanas, mostrar la lista.
  useEffect(() => {
    if (!modoTocado && tieneCvs) setModo("elegir");
  }, [tieneCvs, modoTocado]);

  if (busy) {
    return (
      <div className="py-10">
        <h1 className="mb-8 text-center font-display text-3xl font-semibold tracking-tight">
          Construyendo tu base de <em className="text-accent">hechos</em>…
        </h1>
        <ProcessLoader stages={STAGES_INGESTA} stepMs={2200} />
      </div>
    );
  }

  async function handleFile(file: File) {
    setParsing(true);
    try {
      const extraido = await extractTextFromFile(file);
      onTexto(extraido);
      onArchivo(file); // el original se guarda en la cuenta para re-descargarlo
      toast(`Texto extraído de ${file.name}. Revísalo antes de continuar.`, "ok");
    } catch (e) {
      toast(e instanceof Error ? e.message : "No pude leer el archivo", "error");
    } finally {
      setParsing(false);
    }
  }

  const mostrarLista = tieneCvs && modo === "elegir";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Tu base de <em className="text-accent">hechos</em>.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-2">
          {tieneCvs
            ? "Elige uno de tus CVs guardados o sube uno nuevo. Jano solo usará hechos que estén en él."
            : "Sube tu CV en PDF, Word o texto. Jano lo convierte en hechos auditables con origen."}
        </p>

        {/* Selector: CVs guardados / subir nuevo */}
        {tieneCvs && (
          <div className="mt-5 inline-flex rounded-xl border border-line bg-surface p-1 text-sm">
            <button
              onClick={() => {
                setModoTocado(true);
                setModo("elegir");
              }}
              className={`rounded-lg px-4 py-1.5 font-semibold transition ${
                modo === "elegir" ? "bg-tint text-accent-deep" : "text-muted-2 hover:text-ink"
              }`}
            >
              Mis CVs guardados
            </button>
            <button
              onClick={() => {
                setModoTocado(true);
                setModo("nuevo");
              }}
              className={`rounded-lg px-4 py-1.5 font-semibold transition ${
                modo === "nuevo" ? "bg-tint text-accent-deep" : "text-muted-2 hover:text-ink"
              }`}
            >
              Subir uno nuevo
            </button>
          </div>
        )}

        {mostrarLista ? (
          <ul className="mt-6 space-y-2">
            {savedCvs!.map((cv) => (
              <li
                key={cv.id}
                className="flex items-center justify-between rounded-2xl border border-line bg-surface px-5 py-4 shadow-card"
              >
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    {cv.nombre}
                    {cv.cv_id === activoCvId && <Pill tone="ok">En uso</Pill>}
                  </p>
                  <p className="text-[11px] text-muted">Guardado el {cv.created_at.slice(0, 10)}</p>
                </div>
                <Button variant="mini" onClick={() => onUsar(cv.cv_id, cv.nombre)}>
                  Usar este →
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 space-y-4">
            <FileDrop onFile={handleFile} busy={parsing} />
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-line" />
              o pega el texto
              <span className="h-px flex-1 bg-line" />
            </div>
            <textarea
              value={texto}
              onChange={(e) => onTexto(e.target.value)}
              rows={10}
              aria-label="Texto de tu CV"
              placeholder="Pega aquí el texto completo de tu CV…"
              className="w-full rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed shadow-card outline-none transition focus:border-accent/50"
            />
            <input
              value={nombre}
              onChange={(e) => onNombre(e.target.value)}
              placeholder="Nombre de este CV (ej. CV Product Manager)"
              aria-label="Nombre del CV"
              className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm shadow-card outline-none transition focus:border-accent/50"
            />
            <Button onClick={onGuardarNuevo} disabled={busy || parsing} arrow>
              {busy ? "Estructurando hechos…" : "Guardar CV y continuar"}
            </Button>
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <Pill tone="accent">Regla 01</Pill>
          <h3 className="mt-3 font-display text-xl font-semibold">Guardarraíl anti-invención</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-2">
            El motor solo reordena, reformula y selecciona hechos que estén aquí. Si una oferta pide
            algo ausente, Jano lo expone como pregunta. Nunca lo añade por su cuenta.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <Pill tone="accent">Regla 02</Pill>
          <h3 className="mt-3 font-display text-xl font-semibold">Trazabilidad por bullet</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-2">
            Cada línea del CV adaptado podrá rastrearse hasta una porción concreta de tu CV. Sin
            origen, no entra.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-5 text-xs leading-relaxed text-muted">
          Cada CV que guardas tiene su propia base de hechos. El archivo se lee en tu navegador: el
          PDF nunca se sube a ningún sitio.
        </div>
      </aside>
    </div>
  );
}
