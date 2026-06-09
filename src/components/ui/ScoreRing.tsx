"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number; // 0-100
  size?: number;
  label?: string;
};

// Color segun el score: verde fuerte, indigo medio, rojo flojo (umbrales del PoC).
function colorFor(score: number): string {
  if (score >= 70) return "var(--color-ok)";
  if (score >= 45) return "var(--color-accent)";
  return "var(--color-danger)";
}

export default function ScoreRing({ value, size = 180, label = "Match score" }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const r = 54;
  const C = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Pequeno retraso para que la transicion CSS del anillo se dispare al montar.
    const t = setTimeout(() => setProgress(clamped), 60);
    // Contador numerico sincronizado con la animacion del anillo.
    const start = performance.now();
    const DURATION = 1100;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * clamped));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
    };
  }, [clamped]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`${label}: ${clamped} de 100`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-line)" strokeWidth="9" />
        <circle
          className="ring-progress"
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={colorFor(clamped)}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress / 100)}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-semibold tabular-nums" style={{ fontSize: size * 0.27 }}>
          {display}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{label}</span>
      </div>
    </div>
  );
}
