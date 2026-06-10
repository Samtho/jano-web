"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import CategoryBars from "@/components/ui/CategoryBars";
import Confetti from "@/components/ui/Confetti";
import Pill from "@/components/ui/Pill";
import ScoreRing from "@/components/ui/ScoreRing";
import type { MatchResult } from "@/lib/types";

type Props = {
  match: MatchResult;
  prevScore: number | null;
  onCerrarHuecos: () => void;
  onGenerarCv: () => void;
  onVolver: () => void;
};

export default function StepMatch({ match, prevScore, onCerrarHuecos, onGenerarCv, onVolver }: Props) {
  const delta = prevScore !== null ? match.matchScore - prevScore : null;
  const huecos = match.noCubre.length;
  // Celebracion: score fuerte o subida tras cerrar huecos.
  const [celebrar, setCelebrar] = useState(match.matchScore >= 70 || (delta !== null && delta > 0));

  return (
    <div>
      {celebrar && <Confetti onDone={() => setCelebrar(false)} />}
      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        El <em className="text-accent">cruce</em>.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-2">
        Esto es lo que tu base de hechos cubre de la oferta, sin maquillaje. El score sale de
        similitud semántica con umbral: sin hecho que lo respalde, un requisito no cuenta.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-8 shadow-card">
          <ScoreRing value={match.matchScore} size={190} />
          {delta !== null && delta !== 0 && (
            <span className="pop">
              <Pill tone={delta > 0 ? "ok" : "danger"}>
                {delta > 0 ? `+${delta} puntos tras cerrar huecos` : `${delta} puntos`}
              </Pill>
            </span>
          )}
          <div className="w-full border-t border-line pt-4">
            <CategoryBars porCategoria={match.porCategoria} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <Pill tone="ok">Cubre · {match.cubre.length}</Pill>
            <ul className="mt-4 space-y-2.5">
              {match.cubre.length ? (
                match.cubre.map((r, i) => (
                  <li key={r} className="fade-up flex gap-2 text-sm leading-snug" style={{ "--i": i } as React.CSSProperties}>
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ok" />
                    {r}
                  </li>
                ))
              ) : (
                <li className="text-sm italic text-muted">Tu base de hechos no cubre ningún requisito todavía.</li>
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <Pill tone="danger">No cubre · {huecos}</Pill>
            <ul className="mt-4 space-y-2.5">
              {huecos ? (
                match.noCubre.map((r, i) => (
                  <li key={r} className="fade-up flex gap-2 text-sm leading-snug" style={{ "--i": i } as React.CSSProperties}>
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border-2 border-danger" />
                    {r}
                  </li>
                ))
              ) : (
                <li className="text-sm italic text-muted">Sin huecos: cubres todo lo detectado.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="ghost" onClick={onVolver}>
          ← Cambiar la oferta
        </Button>
        {huecos > 0 && (
          <Button variant="ghost" onClick={onCerrarHuecos}>
            Cerrar huecos ({huecos})
          </Button>
        )}
        <Button onClick={onGenerarCv} arrow>
          Generar CV adaptado
        </Button>
      </div>
    </div>
  );
}
