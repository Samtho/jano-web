"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import ProcessLoader from "@/components/ui/ProcessLoader";
import { useToast } from "@/components/ui/Toast";
import { addPostulacion, mejorarBullet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getMyProfile } from "@/lib/profile";
import { getCvId } from "@/lib/session";
import type { BulletCv, ContactoCv, CvAdaptado } from "@/lib/types";
import PdfPreview, { type AuditSel } from "./PdfPreview";
import type { OfertaMeta } from "./Wizard";

type Props = {
  adaptado: CvAdaptado | null;
  busy: boolean;
  matchScore: number;
  ofertaTexto: string;
  ofertaMeta: OfertaMeta;
  onVolver: () => void;
  onReintentar: () => void;
};

const STAGES_CV = [
  "Leyendo todos tus hechos con origen",
  "Seleccionando los más relevantes para la oferta",
  "Redactando en formato Harvard (solo con tus hechos)",
  "Citando el origen de cada línea",
];

export default function StepCvAdaptado({ adaptado, busy, matchScore, ofertaTexto, ofertaMeta, onVolver, onReintentar }: Props) {
  const toast = useToast();
  const { user } = useAuth();

  const [cv, setCv] = useState<CvAdaptado | null>(adaptado);
  const [sel, setSel] = useState<AuditSel | null>(null);
  const [perfilExtra, setPerfilExtra] = useState<{ telefono?: string; ciudad?: string; linkedin?: string }>({});
  const [alternativas, setAlternativas] = useState<string[] | null>(null);
  const [mejorando, setMejorando] = useState(false);
  const [descargando, setDescargando] = useState(false);

  const [empresa, setEmpresa] = useState("");
  const [puesto, setPuesto] = useState("");
  const [sector, setSector] = useState("");
  const [salario, setSalario] = useState("");
  const [guardandoTracker, setGuardandoTracker] = useState(false);
  const [trackerOk, setTrackerOk] = useState(false);

  useEffect(() => {
    if (adaptado) setCv(adaptado);
  }, [adaptado]);
  useEffect(() => {
    if (ofertaMeta.empresa) setEmpresa((v) => v || ofertaMeta.empresa);
    if (ofertaMeta.titulo) setPuesto((v) => v || ofertaMeta.titulo);
    if (ofertaMeta.sector) setSector((v) => v || ofertaMeta.sector!);
  }, [ofertaMeta]);
  // Telefono/ciudad/linkedin del perfil para la cabecera del CV.
  useEffect(() => {
    getMyProfile().then((p) => {
      if (p)
        setPerfilExtra({
          telefono: p.telefono ?? undefined,
          ciudad: p.ciudad ?? undefined,
          linkedin: p.linkedin ?? undefined,
        });
    });
  }, []);

  const contacto: ContactoCv = {
    nombre: (user?.user_metadata?.nombre as string) || user?.email?.split("@")[0] || "Tu nombre",
    email: user?.email ?? undefined,
    ...perfilExtra,
  };

  const bulletSel: BulletCv | null =
    sel && "si" in sel ? cv?.secciones[sel.si]?.bloques?.[sel.bi]?.bullets?.[sel.bu] ?? null : null;
  const origenSel: string[] = sel
    ? "perfil" in sel
      ? cv?.perfil_origen ?? []
      : bulletSel?.origen ?? []
    : [];

  async function pedirAlternativas() {
    if (!bulletSel) return;
    setMejorando(true);
    setAlternativas(null);
    try {
      const r = await mejorarBullet(bulletSel.texto, bulletSel.origen.join(" | "), ofertaTexto);
      if (!r.alternativas?.length) throw new Error("sin alternativas");
      setAlternativas(r.alternativas);
    } catch {
      toast("No pude generar alternativas ahora. Reintenta.", "error");
    } finally {
      setMejorando(false);
    }
  }

  function aplicarAlternativa(texto: string) {
    if (!sel || !("si" in sel) || !cv) return;
    setCv({
      ...cv,
      secciones: cv.secciones.map((s, si) =>
        si !== sel.si
          ? s
          : {
              ...s,
              bloques: s.bloques?.map((b, bi) =>
                bi !== sel.bi
                  ? b
                  : { ...b, bullets: b.bullets?.map((bu, bui) => (bui !== sel.bu ? bu : { ...bu, texto })) }
              ),
            }
      ),
    });
    setAlternativas(null);
    toast("Bullet actualizado. El origen se mantiene.", "ok");
  }

  async function descargarPdf() {
    if (!cv) return;
    setDescargando(true);
    try {
      // Import dinamico: el generador de PDF solo se carga al pulsar el boton.
      const { descargarCvPdf } = await import("@/lib/cvPdf");
      await descargarCvPdf(cv, contacto, ofertaMeta.empresa || empresa);
      toast("PDF descargado.", "ok");
    } catch (e) {
      toast(`No pude generar el PDF: ${e instanceof Error ? e.message : "error"}`, "error");
    } finally {
      setDescargando(false);
    }
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
        sector: sector.trim(),
        match_score: matchScore,
        salario: salario.trim(),
        cv_id: getCvId(),
      });
      setTrackerOk(true);
      toast("Postulación registrada en tu tracker.", "ok");
    } catch {
      toast("No pude registrar la postulación. Reintenta.", "error");
    } finally {
      setGuardandoTracker(false);
    }
  }

  if (busy) {
    return (
      <div className="py-10">
        <h1 className="mb-2 text-center font-display text-3xl font-semibold tracking-tight">
          Redactando tu CV <em className="text-accent">Harvard</em>…
        </h1>
        <p className="mb-8 text-center text-sm text-muted-2">Nada se inventa: cada línea citará su origen.</p>
        <ProcessLoader stages={STAGES_CV} stepMs={2000} />
      </div>
    );
  }

  // Fallo en la generacion: estado de error con reintento (nunca loader infinito).
  if (!cv) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">No pude generar el CV</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-2">
          Algo falló al redactarlo. Suele resolverse reintentando.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="ghost" onClick={onVolver}>
            ← Volver al match
          </Button>
          <Button onClick={onReintentar} arrow>
            Reintentar
          </Button>
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
            Formato Harvard. Haz clic en una línea para auditar su origen o pedir otras redacciones.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onVolver}>
            ← Volver al match
          </Button>
          <Button onClick={descargarPdf} disabled={descargando} arrow>
            {descargando ? "Generando…" : "Descargar PDF"}
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* La preview ES el PDF real (mismo blob que la descarga). */}
        <PdfPreview
          cv={cv}
          contacto={contacto}
          selActiva={sel}
          onAudit={(s) => {
            setSel(s);
            setAlternativas(null);
          }}
        />

        {/* Panel: auditar + mejorar + tracker */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold">Auditar y mejorar</h3>
            <p className="mt-1 text-xs text-muted">Clic en cualquier línea del CV.</p>
            {sel ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-accent/20 bg-tint p-4">
                  <Pill tone="accent">{origenSel.length > 1 ? `${origenSel.length} hechos de origen` : "Origen verificado"}</Pill>
                  <div className="mt-3 space-y-2">
                    {origenSel.length ? (
                      origenSel.map((o, i) => (
                        <p key={i} className="text-sm font-medium leading-relaxed">
                          &ldquo;{o}&rdquo;
                        </p>
                      ))
                    ) : (
                      <p className="text-xs italic text-muted">Esta línea no declaró evidencia específica.</p>
                    )}
                  </div>
                </div>
                {bulletSel && (
                  <Button variant="mini" onClick={pedirAlternativas} disabled={mejorando}>
                    {mejorando ? "Pensando alternativas…" : "✦ Proponer otras redacciones"}
                  </Button>
                )}
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
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-xs italic text-muted">
                Aún no has seleccionado ninguna línea.
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
                <input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Empresa" aria-label="Empresa" className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-sm outline-none transition focus:border-accent/50" />
                <input value={puesto} onChange={(e) => setPuesto(e.target.value)} placeholder="Puesto" aria-label="Puesto" className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-sm outline-none transition focus:border-accent/50" />
                <div className="flex gap-2">
                  <input value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Sector (opcional)" aria-label="Sector" className="w-1/2 rounded-xl border border-line bg-paper px-3.5 py-2 text-sm outline-none transition focus:border-accent/50" />
                  <input value={salario} onChange={(e) => setSalario(e.target.value)} placeholder="Salario (opcional)" aria-label="Salario" className="w-1/2 rounded-xl border border-line bg-paper px-3.5 py-2 text-sm outline-none transition focus:border-accent/50" />
                </div>
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
