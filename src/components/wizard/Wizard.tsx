"use client";

import { useEffect, useState } from "react";
import Stepper from "@/components/ui/Stepper";
import { useToast } from "@/components/ui/Toast";
import * as api from "@/lib/api";
import { getCvId, loadSession, saveCv, saveOferta } from "@/lib/session";
import type { CvAdaptado, MatchResult } from "@/lib/types";
import StepCv from "./StepCv";
import StepOferta from "./StepOferta";
import StepMatch from "./StepMatch";
import StepHuecos from "./StepHuecos";
import StepCvAdaptado from "./StepCvAdaptado";

const STEPS = ["Tu CV", "La oferta", "El match", "Huecos", "CV adaptado"];

export default function Wizard() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);

  // Paso 1: CV
  const [cvTexto, setCvTexto] = useState("");
  const [cvGuardado, setCvGuardado] = useState(false);
  const [cvBusy, setCvBusy] = useState(false);

  // Paso 2: oferta
  const [ofertaTexto, setOfertaTexto] = useState("");
  const [matchBusy, setMatchBusy] = useState(false);

  // Paso 3-4: match y huecos
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [prevScore, setPrevScore] = useState<number | null>(null);
  const [respondidos, setRespondidos] = useState<string[]>([]);

  // Paso 5: CV adaptado
  const [adaptado, setAdaptado] = useState<CvAdaptado | null>(null);
  const [adaptadoBusy, setAdaptadoBusy] = useState(false);

  // Restaurar sesion del navegador (solo en cliente).
  useEffect(() => {
    const s = loadSession();
    if (s.cvTexto) setCvTexto(s.cvTexto);
    if (s.cvGuardado) {
      setCvGuardado(true);
      setMaxReached((m) => Math.max(m, 2));
    }
    if (s.ofertaTexto) setOfertaTexto(s.ofertaTexto);
  }, []);

  function go(n: number) {
    setStep(n);
    setMaxReached((m) => Math.max(m, n));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function guardarCv() {
    if (cvTexto.trim().length < 50) {
      toast("El CV parece muy corto. Pega el texto completo o sube un archivo.", "error");
      return;
    }
    setCvBusy(true);
    try {
      const r = await api.ingestCv(getCvId(), cvTexto.trim());
      saveCv(cvTexto.trim(), true);
      setCvGuardado(true);
      // El CV cambio: el match y el CV adaptado anteriores dejan de valer.
      setMatch(null);
      setAdaptado(null);
      setRespondidos([]);
      toast(`Base de hechos creada: ${r.guardados} hechos con origen`, "ok");
      go(2);
    } catch (e) {
      toast(`No pude procesar el CV: ${e instanceof Error ? e.message : "error"}`, "error");
    } finally {
      setCvBusy(false);
    }
  }

  async function calcularMatch(origenPaso4 = false) {
    if (ofertaTexto.trim().length < 40) {
      toast("Pega el texto de la oferta (o usa el enlace) antes de calcular.", "error");
      return;
    }
    setMatchBusy(true);
    if (match) setPrevScore(match.matchScore);
    try {
      saveOferta(ofertaTexto.trim());
      const r = await api.matchOferta(getCvId(), ofertaTexto.trim());
      setMatch(r);
      setAdaptado(null);
      if (origenPaso4 && prevScoreRefSafe(match) !== null) {
        const delta = r.matchScore - (match?.matchScore ?? 0);
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

  function prevScoreRefSafe(m: MatchResult | null) {
    return m ? m.matchScore : null;
  }

  async function responderHueco(requisito: string, respuesta: string) {
    await api.guardarHueco(getCvId(), requisito, respuesta);
    setRespondidos((r) => [...r, requisito]);
  }

  async function generarAdaptado() {
    go(5);
    if (adaptado || adaptadoBusy) return;
    setAdaptadoBusy(true);
    try {
      const r = await api.cvAdaptado(getCvId(), ofertaTexto.trim());
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
      <div className="mt-8">
        {step === 1 && (
          <StepCv
            texto={cvTexto}
            onTexto={setCvTexto}
            guardado={cvGuardado}
            busy={cvBusy}
            onGuardar={guardarCv}
          />
        )}
        {step === 2 && (
          <StepOferta
            texto={ofertaTexto}
            onTexto={setOfertaTexto}
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
            noCubre={match.noCubre}
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
            busy={adaptadoBusy}
            matchScore={match?.matchScore ?? 0}
            onVolver={() => go(3)}
          />
        )}
      </div>
    </div>
  );
}
