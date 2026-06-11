"use client";

import { useEffect, useRef, useState } from "react";
import Stepper from "@/components/ui/Stepper";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api";
import { getCvId, loadSession, newCvId, saveOferta, setActiveCvId } from "@/lib/session";
import { listMyCvs, saveMyCv, type SavedCv } from "@/lib/cvs";
import type { CvAdaptado, MatchResult } from "@/lib/types";
import StepCv from "./StepCv";
import StepOferta from "./StepOferta";
import StepMatch from "./StepMatch";
import StepHuecos from "./StepHuecos";
import StepCvAdaptado from "./StepCvAdaptado";

const STEPS = ["Tu CV", "La oferta", "El match", "Huecos", "CV adaptado"];

export type OfertaMeta = { titulo: string; empresa: string; sector?: string };

export default function Wizard() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);

  // Paso 1: CV (CVs guardados de la cuenta + subir uno nuevo)
  const [savedCvs, setSavedCvs] = useState<SavedCv[] | null>(null);
  const [cvTexto, setCvTexto] = useState("");
  const [nombreCv, setNombreCv] = useState("");
  const [archivoCv, setArchivoCv] = useState<File | null>(null);
  const [cvBusy, setCvBusy] = useState(false);

  // Paso 2: oferta
  const [ofertaTexto, setOfertaTexto] = useState("");
  const [ofertaMeta, setOfertaMeta] = useState<OfertaMeta>({ titulo: "", empresa: "" });
  const [ofertaDelMatch, setOfertaDelMatch] = useState(""); // la oferta con la que se calculo el match vigente
  const [matchBusy, setMatchBusy] = useState(false);

  // Paso 3-4: match y huecos
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [prevScore, setPrevScore] = useState<number | null>(null);
  const [respondidos, setRespondidos] = useState<string[]>([]);

  // Paso 5: CV adaptado (se pre-genera en segundo plano al terminar el match)
  const [adaptado, setAdaptado] = useState<CvAdaptado | null>(null);
  const [adaptadoBusy, setAdaptadoBusy] = useState(false);
  const prefetchRef = useRef<Promise<CvAdaptado> | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (s.ofertaTexto) setOfertaTexto(s.ofertaTexto);
    listMyCvs().then(setSavedCvs).catch(() => setSavedCvs([]));
  }, []);

  function go(n: number) {
    setStep(n);
    setMaxReached((m) => Math.max(m, n));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetDesdeCv() {
    setMatch(null);
    setPrevScore(null);
    setAdaptado(null);
    prefetchRef.current = null;
    setRespondidos([]);
    // Los pasos 3-5 dejan de ser alcanzables: sus datos ya no valen.
    setMaxReached(2);
  }

  // Editar la oferta invalida el match vigente (evita scores de la oferta anterior).
  function cambiarOferta(texto: string) {
    setOfertaTexto(texto);
    if (match && texto.trim() !== ofertaDelMatch) {
      resetDesdeCv();
      toast("La oferta cambió: recalcula el match.", "info");
    }
  }

  // Elegir un CV ya guardado en la cuenta: sus hechos ya estan en la base.
  function usarCvGuardado(cvId: string, nombre: string) {
    setActiveCvId(cvId);
    resetDesdeCv();
    toast(`Usando "${nombre}". Ahora la oferta.`, "ok");
    go(2);
  }

  // Subir un CV nuevo: se crea un cvId nuevo, se ingieren los hechos y se
  // guarda en la cuenta con su nombre.
  async function guardarCvNuevo() {
    if (cvTexto.trim().length < 50) {
      toast("El CV parece muy corto. Pega el texto completo o sube un archivo.", "error");
      return;
    }
    if (!nombreCv.trim()) {
      toast("Ponle un nombre a este CV (ej. CV Product Manager).", "error");
      return;
    }
    setCvBusy(true);
    try {
      const cvId = newCvId();
      const r = await api.ingestCv(cvId, cvTexto.trim());
      await saveMyCv(cvId, nombreCv.trim(), archivoCv);
      setArchivoCv(null);
      resetDesdeCv();
      listMyCvs().then(setSavedCvs).catch(() => {});
      toast(`"${nombreCv.trim()}" guardado: ${r.guardados} hechos con origen`, "ok");
      // Red de seguridad: documento largo con pocos hechos = extraccion floja.
      if (cvTexto.length > 6000 && r.guardados < 12) {
        toast("Salieron pocos hechos para un documento tan largo. Considera re-subirlo.", "info");
      }
      setNombreCv("");
      setCvTexto("");
      go(2);
    } catch (e) {
      toast(`No pude procesar el CV: ${e instanceof Error ? e.message : "error"}`, "error");
    } finally {
      setCvBusy(false);
    }
  }

  function prefetchAdaptado(oferta: string) {
    setAdaptado(null);
    const p = api.cvAdaptado(getCvId(), oferta);
    prefetchRef.current = p;
    p.then((r) => {
      if (prefetchRef.current === p) setAdaptado(r);
    }).catch(() => {
      if (prefetchRef.current === p) prefetchRef.current = null;
    });
  }

  async function calcularMatch(desdeHuecos = false) {
    if (ofertaTexto.trim().length < 40) {
      toast("Pega el texto de la oferta (o usa el enlace) antes de calcular.", "error");
      return;
    }
    setMatchBusy(true);
    const scoreAnterior = match?.matchScore ?? null;
    try {
      saveOferta(ofertaTexto.trim());
      const r = await api.matchOferta(getCvId(), ofertaTexto.trim());
      setPrevScore(desdeHuecos ? scoreAnterior : null);
      setMatch(r);
      // Prefill del registro: la empresa/puesto/sector que el motor saca de la oferta pegada.
      setOfertaMeta((m) => ({
        titulo: r.puesto || m.titulo,
        empresa: r.empresa || m.empresa,
        sector: r.sector || m.sector,
      }));
      setOfertaDelMatch(ofertaTexto.trim());
      prefetchAdaptado(ofertaTexto.trim());
      if (desdeHuecos && scoreAnterior !== null) {
        const delta = r.matchScore - scoreAnterior;
        if (delta > 0) toast(`Tu score subio ${delta} puntos`, "ok");
        else if (delta === 0) toast("El score se mantiene. Prueba con respuestas mas concretas.", "info");
      }
      go(3);
    } catch (e) {
      toast(`Fallo el match: ${e instanceof Error ? e.message : "error"}`, "error");
    } finally {
      setMatchBusy(false);
    }
  }

  async function responderHueco(requisito: string, respuesta: string) {
    await api.guardarHueco(getCvId(), requisito, respuesta);
    setRespondidos((r) => [...r, requisito]);
  }

  async function generarAdaptado() {
    go(5);
    if (adaptado) return;
    setAdaptadoBusy(true);
    try {
      const r = prefetchRef.current
        ? await prefetchRef.current
        : await api.cvAdaptado(getCvId(), ofertaTexto.trim());
      setAdaptado(r);
    } catch (e) {
      toast(`No pude generar el CV adaptado: ${e instanceof Error ? e.message : "error"}`, "error");
    } finally {
      setAdaptadoBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Stepper steps={STEPS} current={step} maxReached={maxReached} onGo={go} />
      <div key={step} className="step-in mt-8">
        {step === 1 && (
          <StepCv
            texto={cvTexto}
            onTexto={setCvTexto}
            nombre={nombreCv}
            onNombre={setNombreCv}
            savedCvs={savedCvs}
            onUsar={usarCvGuardado}
            busy={cvBusy}
            onGuardarNuevo={guardarCvNuevo}
            onArchivo={setArchivoCv}
          />
        )}
        {step === 2 && (
          <StepOferta
            texto={ofertaTexto}
            onTexto={cambiarOferta}
            onMeta={setOfertaMeta}
            busy={matchBusy}
            onCalcular={() => calcularMatch(false)}
            onVolver={() => go(1)}
          />
        )}
        {step === 3 && match && (
          <StepMatch
            match={match}
            prevScore={prevScore}
            onCerrarHuecos={() => go(4)}
            onGenerarCv={generarAdaptado}
            onVolver={() => go(2)}
          />
        )}
        {step === 4 && match && (
          <StepHuecos
            noCubre={match.noCubre ?? []}
            respondidos={respondidos}
            busy={matchBusy}
            onResponder={responderHueco}
            onRecalcular={() => calcularMatch(true)}
            onVolver={() => go(3)}
          />
        )}
        {step === 5 && (
          <StepCvAdaptado
            adaptado={adaptado}
            busy={adaptadoBusy && !adaptado}
            matchScore={match?.matchScore ?? 0}
            ofertaTexto={ofertaTexto}
            ofertaMeta={ofertaMeta}
            onVolver={() => go(3)}
            onReintentar={generarAdaptado}
          />
        )}
      </div>
    </div>
  );
}
