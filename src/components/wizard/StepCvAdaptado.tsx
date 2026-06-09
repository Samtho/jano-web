"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import { useToast } from "@/components/ui/Toast";
import { addPostulacion } from "@/lib/api";
import { getCvId } from "@/lib/session";
import type { BulletCv, CvAdaptado } from "@/lib/types";

type Props = {
  adaptado: CvAdaptado | null;
  busy: boolean;
  matchScore: number;
  onVolver: () => void;
};

export default function StepCvAdaptado({ adaptado, busy, matchScore, onVolver }: Props) {
  const toast = useToast();
  const [seleccionado, setSeleccionado] = useState<BulletCv | null>(null);
  const [empresa, setEmpresa] = useState("");
  const [puesto, setPuesto] = useState("");
  const [guardandoTracker, setGuardandoTracker] = useState(false);
  const [trackerOk, setTrackerOk] = useState(false);

  async function guardarEnTracker() {
    if (!empresa.trim()) {
      toast("Escribe al menos la empresa para registrar el envío.", "error");
      return;
    }
    setGuardandoTracker(true);
    try {
      await addPostulacion({
        empresa: empresa.trim(),
        puesto: puesto.trim(),
        sector: "",
        match_score: matchScore,
        salario: "",
        cv_id: getCvId(),
      });
      setTrackerOk(true);
      toast("Postulación registrada en tu tracker. Cero doble entrada.", "ok");
    } catch {
      toast("No pude registrar la postulación. Reintenta.", "error");
    } finally {
      setGuardandoTracker(false);
    }
  }

  if (busy || !adaptado) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Redactando tu CV <em className="text-accent">adaptado</em>…
        </h1>
        <p className="text-sm text-muted-2">
          Jano está reordenando y reformulando tus hechos para esta oferta. No inventa nada: cada
          bullet citará su origen.
        </p>
        <div className="space-y-3 pt-4" aria-live="polite" aria-label="Generando CV">
          <div className="skeleton h-7 w-1/3" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-7 w-1/4" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            CV <em className="text-accent">adaptado</em>.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-2">
            Haz clic en cualquier bullet para ver su origen exacto en tu base de hechos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onVolver}>
            ← Volver al match
          </Button>
          <Button variant="ghost" onClick={() => window.print()}>
            Imprimir / PDF
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Hoja del CV */}
        <div className="print-area rounded-2xl border border-line bg-surface p-8 shadow-card">
          {adaptado.secciones.map((s) => (
            <section key={s.titulo} className="mb-6 last:mb-0">
              <h2 className="border-b border-line pb-1.5 font-display text-lg font-semibold uppercase tracking-wide">
                {s.titulo}
              </h2>
              <ul className="mt-3 space-y-2">
                {s.bullets.map((b, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setSeleccionado(b)}
                      className={`w-full rounded-lg px-3 py-1.5 text-left text-sm leading-relaxed transition ${
                        seleccionado === b ? "bg-tint ring-1 ring-accent/40" : "hover:bg-tint/60"
                      }`}
                    >
                      {b.texto}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Panel de trazabilidad + tracker */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold">Origen del bullet</h3>
            <p className="mt-1 text-xs text-muted">Clic en cualquier línea del CV para auditarla.</p>
            {seleccionado ? (
              <div className="mt-4 rounded-xl border border-accent/20 bg-tint p-4">
                <Pill tone="accent">Origen verificado</Pill>
                <p className="mt-3 text-sm font-medium leading-relaxed">&ldquo;{seleccionado.origen}&rdquo;</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-2">
                  Este bullet se apoya en ese hecho de tu base. Si el hecho no existiera, el bullet
                  tampoco.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-xs italic text-muted">
                Aún no has seleccionado ningún bullet.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold">Registrar el envío</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Marca esta postulación como enviada y aparecerá en tu tracker con el score {matchScore}.
            </p>
            {trackerOk ? (
              <div className="mt-4 space-y-3">
                <Pill tone="ok">Registrada en el tracker</Pill>
                <Button variant="ghost" href="/tracker/">
                  Ver mi tracker
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <input
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Empresa"
                  aria-label="Empresa"
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-sm outline-none transition focus:border-accent/50"
                />
                <input
                  value={puesto}
                  onChange={(e) => setPuesto(e.target.value)}
                  placeholder="Puesto"
                  aria-label="Puesto"
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-sm outline-none transition focus:border-accent/50"
                />
                <Button onClick={guardarEnTracker} disabled={guardandoTracker} arrow>
                  {guardandoTracker ? "Registrando…" : "Marcar como enviada"}
                </Button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
