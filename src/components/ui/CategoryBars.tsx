"use client";

import { useEffect, useState } from "react";
import type { CategoriaDetalle } from "@/lib/types";

const LABELS: Record<string, string> = {
  experiencia: "Experiencia",
  habilidades: "Habilidades",
  perfil: "Perfil",
  idiomas: "Idiomas",
  otros: "Otros",
};

export default function CategoryBars({ porCategoria }: { porCategoria: Record<string, CategoriaDetalle> }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const entries = Object.entries(porCategoria);
  if (!entries.length) return null;

  return (
    <div className="space-y-3">
      {entries.map(([cat, d], i) => (
        <div key={cat}>
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="font-semibold text-ink">{LABELS[cat] ?? cat}</span>
            <span className="text-muted">
              {d.cubiertos}/{d.total} · peso {d.peso}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-line/60">
            <div
              className="bar-progress h-full rounded-full bg-accent"
              style={{
                width: mounted ? `${d.coberturaPct}%` : "0%",
                transitionDelay: `${i * 90}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
