"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ofertaDesdeUrl } from "@/lib/api";

type Props = {
  texto: string;
  onTexto: (t: string) => void;
  busy: boolean;
  onCalcular: () => void;
  onVolver: () => void;
};

export default function StepOferta({ texto, onTexto, busy, onCalcular, onVolver }: Props) {
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
        toast("Oferta extraída del enlace. Revísala antes de calcular.", "ok");
      } else {
        toast("Ese sitio no me dejó leer la oferta (pasa con LinkedIn). Pega el texto a mano.", "error");
      }
    } catch {
      toast("No pude leer la URL. Pega el texto de la oferta a mano.", "error");
    } finally {
      setUrlBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          La <em className="text-accent">oferta</em>.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-2">
          Pega el texto de la oferta o trae el contenido desde un enlace público. Jano extraerá los
          requisitos y los cruzará con tu base de hechos.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://… (enlace a una oferta pública)"
              aria-label="URL de la oferta"
              className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm shadow-card outline-none transition focus:border-accent/50"
            />
            <Button variant="ghost" onClick={traerDeUrl} disabled={urlBusy}>
              {urlBusy ? "Leyendo…" : "Traer oferta"}
            </Button>
          </div>
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
            <Button onClick={onCalcular} disabled={busy} arrow>
              {busy ? "Cruzando con tus hechos…" : "Calcular match"}
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
          Con enlaces de LinkedIn el sitio suele bloquear la lectura anónima: si pasa, pega el texto.
          Con portales públicos suele funcionar.
        </div>
      </aside>
    </div>
  );
}
