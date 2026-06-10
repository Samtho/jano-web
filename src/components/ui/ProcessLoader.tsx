"use client";

import { useEffect, useState } from "react";

// Carga narrada: en vez de un spinner anonimo, muestra las etapas reales del
// proceso avanzando. La ultima etapa queda "en curso" hasta que el padre
// desmonte el componente (cuando llega la respuesta real).
export default function ProcessLoader({ stages, stepMs = 1700 }: { stages: string[]; stepMs?: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= stages.length - 1) return;
    const t = setTimeout(() => setActive((a) => a + 1), stepMs);
    return () => clearTimeout(t);
  }, [active, stages.length, stepMs]);

  return (
    <div
      className="mx-auto max-w-md rounded-2xl border border-line bg-surface p-6 shadow-card"
      role="status"
      aria-live="polite"
    >
      <ol className="space-y-3.5">
        {stages.map((s, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={s} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                  done
                    ? "bg-ok text-white"
                    : current
                    ? "pulse-dot bg-accent text-white"
                    : "bg-line text-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={done ? "text-muted line-through decoration-line" : current ? "font-semibold" : "text-muted"}>
                {s}
                {current && <span className="ml-1 animate-pulse">…</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
