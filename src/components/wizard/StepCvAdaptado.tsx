"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import ProcessLoader from "@/components/ui/ProcessLoader";
import { useToast } from "@/components/ui/Toast";
import { addPostulacion, mejorarBullet } from "@/lib/api";
import { getCvId } from "@/lib/session";
import type { BulletCv, CvAdaptado } from "@/lib/types";
import type { OfertaMeta } from "./Wizard";

type Props = {
  adaptado: CvAdaptado | null;
  busy: boolean;
  matchScore: number;
  ofertaTexto: string;
  ofertaMeta: OfertaMeta;
  onVolver: () => void;
};

const STAGES_CV = [
  "Leyendo todos tus hechos con origen",
  "Seleccionando los más relevantes para la oferta",
  "Redactando cada bullet (solo con tus hechos)",
  "Citando el origen de cada línea",
];

type Sel = { s: number; b: number } | null;

export default function StepCvAdaptado({ adaptado, busy, matchScore, ofertaTexto, ofertaMeta, onVolver }: Props) {
  const toast = useToast();
  // Copia editable del CV (para reemplazar bullets con las alternativas de la IA).
  const [secciones, setSecciones] = useState(adaptado?.secciones ?? []);
  const [sel, setSel] = useState<Sel>(null);
  const [alternativas, setAlternativas] = useState<string[] | null>(null);
  const [mejorando, setMejorando] = useState(false);

  const [empresa, setEmpresa] = useState("");
  const [puesto, setPuesto] = useState("");
  const [guardandoTracker, setGuardandoTracker] = useState(false);
  const [trackerOk, setTrackerOk] = useState(false);

  // Sincronizar cuando llega el CV generado + autorellenar empresa/puesto desde la oferta.
  useEffect(() => {
    if (adaptado) setSecciones(adaptado.secciones);
  }, [adaptado]);
  useEffect(() => {
    if (ofertaMeta.empresa) setEmpresa((v) => v || ofertaMeta.empresa);
    if (ofertaMeta.titulo) setPuesto((v) => v || ofertaMeta.titulo);
  }, [ofertaMeta]);

  const bulletSel: BulletCv | null = sel ? secciones[sel.s]?.bullets[sel.b] ?? null : null;

  function seleccionar(s: number, b: number) {
    setSel({ s, b });
    setAlternativas(null);
  }

  async function pedirAlternativas() {
    if (!bulletSel) return;
    setMejorando(true);
    setAlternativas(null);
    try {
      const r = await mejorarBullet(bulletSel.texto, bulletSel.origen, ofertaTexto);
      if (!r.alternativas?.length) throw new Error("sin alternativas");
      setAlternativas(r.alternativas);
    } catch {
      toast("No pude generar alternativas ahora. Reintenta.", "error");
    } finally {
      setMejorando(false);
    }
  }

  function aplicarAlternativa(texto: string) {
    if (!sel) return;
    setSecciones((prev) =>
      prev.map((s, si) =>
        si !== sel.s
          ? s
          : {
              ...s,
              bullets: s.bullets.map((b, bi) => (bi !== sel.b ? b : { ...b, texto })),
            }
      )
    );
    setAlternativas(null);
    toast("Bullet actualizado. El origen se mantiene.", "ok");
  }

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

  if (busy || !secciones.length) {
    return (
      <div className="py-10">
        <h1 className="mb-2 text-center font-display text-3xl font-semibold tracking-tight">
          Redactando tu CV <em className="text-accent">adaptado</em>…
        </h1>
        <p className="mb-8 text-center text-sm text-muted-2">
          Nada se inventa: cada bullet citará su origen.
        </p>
        <ProcessLoader stages={STAGES_CV} stepMs={2000} />
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
            Haz clic en un bullet para auditar su origen o pedirle a la IA otras redacciones (sin
            salirse del hecho).
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
          {secciones.map((s, si) => (
            <section key={s.titulo} className="mb-6 last:mb-0">
              <h2 className="border-b border-line pb-1.5 font-display text-lg font-semibold uppercase tracking-wide">
                {s.titulo}
              </h2>
              <ul className="mt-3 space-y-2">
                {s.bullets.map((b, bi) => {
                  const activo = sel?.s === si && sel?.b === bi;
                  return (
                    <li key={bi}>
                      <button
                        onClick={() => seleccionar(si, bi)}
                        className={`w-full rounded-lg px-3 py-1.5 text-left text-sm leading-relaxed transition ${
                          activo ? "bg-tint ring-1 ring-accent/40" : "hover:bg-tint/60"
                        }`}
                      >
                        {b.texto}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {/* Panel: trazabilidad + IA + tracker */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold">Auditar y mejorar</h3>
            <p className="mt-1 text-xs text-muted">Clic en cualquier línea del CV.</p>
            {bulletSel ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-accent/20 bg-tint p-4">
                  <Pill tone="accent">Origen verificado</Pill>
                  <p className="mt-3 text-sm font-medium leading-relaxed">&ldquo;{bulletSel.origen}&rdquo;</p>
                </div>
                <Button variant="mini" onClick={pedirAlternativas} disabled={mejorando}>
                  {mejorando ? "Pensando alternativas…" : "✦ Proponer otras redacciones"}
                </Button>
                {mejorando && (
                  <div className="space-y-2" aria-live="polite">
                    <div className="skeleton h-9 w-full" />
                    <div className="skeleton h-9 w-full" />
                    <div className="skeleton h-9 w-5/6" />
                  </div>
                )}
                {alternativas && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Elige una (mismo hecho, otra voz)
                    </p>
                    {alternativas.map((a, i) => (
                      <button
                        key={i}
                        onClick={() => aplicarAlternativa(a)}
                        className="pop block w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-left text-xs leading-relaxed transition hover:border-accent/50 hover:bg-tint"
                        style={{ animationDelay: `${i * 90}ms` }}
                      >
                        {a}
                      </button>
                    ))}
                    <p className="text-[11px] leading-relaxed text-muted">
                      Guardarraíl activo: las alternativas solo pueden afirmar lo que respalda el
                      hecho de origen.
                    </p>
                  </div>
                )}
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
                <span className="pop inline-block">
                  <Pill tone="ok">Registrada en el tracker</Pill>
                </span>
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
