"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import FileDrop from "@/components/ui/FileDrop";
import Pill from "@/components/ui/Pill";
import ProcessLoader from "@/components/ui/ProcessLoader";
import { useToast } from "@/components/ui/Toast";
import { extractTextFromFile } from "@/lib/parsers";

const STAGES_INGESTA = [
  "Leyendo tu CV",
  "Extrayendo hechos con su origen",
  "Vectorizando cada hecho (embeddings)",
  "Guardando tu base de hechos",
];

type Props = {
  texto: string;
  onTexto: (t: string) => void;
  guardado: boolean;
  busy: boolean;
  onGuardar: () => void;
};

export default function StepCv({ texto, onTexto, guardado, busy, onGuardar }: Props) {
  const toast = useToast();
  const [parsing, setParsing] = useState(false);

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
      toast(`Texto extraído de ${file.name}. Revísalo antes de continuar.`, "ok");
    } catch (e) {
      toast(e instanceof Error ? e.message : "No pude leer el archivo", "error");
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Tu base de <em className="text-accent">hechos</em>.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-2">
          Sube tu CV en PDF, Word o texto. Jano lo convierte en hechos auditables con origen. Nada de
          lo que no esté aquí saldrá después.
        </p>

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
            rows={12}
            aria-label="Texto de tu CV"
            placeholder="Pega aquí el texto completo de tu CV…"
            className="w-full rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed shadow-card outline-none transition focus:border-accent/50"
          />
          <div className="flex items-center gap-3">
            <Button onClick={onGuardar} disabled={busy || parsing} arrow>
              {busy ? "Estructurando hechos…" : guardado ? "Actualizar mi base de hechos" : "Estructurar mis hechos"}
            </Button>
            {guardado && <Pill tone="ok">CV guardado</Pill>}
          </div>
        </div>
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
            Cada línea del CV adaptado podrá rastrearse hasta una porción concreta de este texto. Sin
            origen, no entra.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-5 text-xs leading-relaxed text-muted">
          Tu CV se procesa con tu propio identificador anónimo. El texto se extrae del archivo en tu
          navegador: el PDF nunca se sube a ningún sitio.
        </div>
      </aside>
    </div>
  );
}
