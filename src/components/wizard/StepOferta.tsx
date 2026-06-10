"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ProcessLoader from "@/components/ui/ProcessLoader";
import { useToast } from "@/components/ui/Toast";
import { ofertaDesdeUrl } from "@/lib/api";
import type { OfertaMeta } from "./Wizard";

type Props = {
  texto: string;
  onTexto: (t: string) => void;
  onMeta: (m: OfertaMeta) => void;
  busy: boolean;
  onCalcular: () => void;
  onVolver: () => void;
};

const STAGES_MATCH = [
  "Extrayendo los requisitos de la oferta",
  "Clasificando por categoría (experiencia, skills, idiomas…)",
  "Buscando cada requisito en tu base de hechos",
  "Aplicando el guardarraíl y ponderando el score",
];

export default function StepOferta({ texto, onTexto, onMeta, busy, onCalcular, onVolver }: Props) {
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [urlBusy, setUrlBusy] = useState(false);

  async function traerDeUrl() {
    if (!/^https?:\/\//.test(url.trim())) {
      toast("Pega una URL completa (https://…)", "error");
      return;
    }
    setUrlBusy(true);
    try {
      const r = await ofertaDesdeUrl(url.trim());
      if (r.oferta_texto && r.oferta_texto.length > 100) {
        onTexto(r.oferta_texto);
        onMeta({ titulo: r.titulo ?? "", empresa: r.empresa ?? "" });
        const quien = r.empresa ? ` de ${r.empresa}` : "";
        toast(`Oferta${quien} extraída del enlace. Revísala antes de calcular.`, "ok");
      } else {
        toast("Ese sitio no me dejó leer la oferta. Pega el texto a mano y seguimos.", "error");
      }
    } catch {
      toast("No pude leer la URL. Pega el texto de la oferta a mano.", "error");
    } finally {
      setUrlBusy(false);
    }
  }

  if (busy) {
    return (
      <div className="py-10">
        <h1 className="mb-8 text-center font-display text-3xl font-semibold tracking-tight">
          Cruzando la oferta con tus <em className="text-accent">hechos</em>…
        </h1>
        <ProcessLoader stages={STAGES_MATCH} stepMs={2100} />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          La <em className="text-accent">oferta</em>.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-2">
          Pega el texto de la oferta o trae el contenido desde un enlace. Jano extraerá los
          requisitos y los cruzará con tu base de hechos.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && traerDeUrl()}
              placeholder="https://… (enlace a la oferta, LinkedIn incluido)"
              aria-label="URL de la oferta"
              className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm shadow-card outline-none transition focus:border-accent/50"
            />
            <Button variant="ghost" onClick={traerDeUrl} disabled={urlBusy}>
              {urlBusy ? "Leyendo…" : "Traer oferta"}
            </Button>
          </div>
          {urlBusy && (
            <p className="text-xs text-muted" aria-live="polite">
              Leyendo la página… si el sitio bloquea, pruebo automáticamente por una vía alternativa
              (puede tardar unos segundos).
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            o pega el texto
            <span className="h-px flex-1 bg-line" />
          </div>
          <textarea
            value={texto}
            onChange={(e) => onTexto(e.target.value)}
            rows={12}
            aria-label="Texto de la oferta"
            placeholder="Pega aquí el texto completo de la oferta…"
            className="w-full rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed shadow-card outline-none transition focus:border-accent/50"
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onVolver}>
              ← Volver
            </Button>
            <Button onClick={onCalcular} arrow>
              Calcular match
            </Button>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h3 className="font-display text-xl font-semibold">Qué hará Jano</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-2">
            <li>· Extraer los requisitos y clasificarlos por categoría.</li>
            <li>· Buscar cada uno en tu base de hechos con embeddings (similitud semántica real).</li>
            <li>· Ponderar por categoría: experiencia y habilidades pesan más que el resto.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-5 text-xs leading-relaxed text-muted">
          Para enlaces con muro (como LinkedIn) Jano intenta una segunda vía de lectura automática.
          Si aun así no se puede, pega el texto: el resultado es el mismo.
        </div>
      </aside>
    </div>
  );
}
