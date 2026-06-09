"use client";

import { useEffect, useState } from "react";
import Pill from "@/components/ui/Pill";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import { getPostulaciones } from "@/lib/api";
import type { Postulacion } from "@/lib/types";

function Kpi({ label, value, hint, index }: { label: string; value: string; hint?: string; index: number }) {
  return (
    <div
      className="fade-up rounded-2xl border border-line bg-surface p-5 shadow-card"
      style={{ "--i": index } as React.CSSProperties}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default function TrackerView() {
  const [rows, setRows] = useState<Postulacion[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPostulaciones()
      .then(setRows)
      .catch(() => setError(true));
  }, []);

  // KPIs derivados de los datos reales.
  const total = rows?.length ?? 0;
  const conRespuesta = rows?.filter((r) => r.estado !== "enviada" && r.estado !== "sin_respuesta").length ?? 0;
  const entrevistas = rows?.filter((r) => r.estado === "entrevista").length ?? 0;
  const matchMedio = rows && rows.length
    ? Math.round(rows.reduce((acc, r) => acc + (r.match_score ?? 0), 0) / rows.length)
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Tu <em className="text-accent">panel</em> de búsqueda.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-2">
            Cada CV que marcas como enviado crea una fila aquí, sin doble entrada. Datos en vivo desde
            la base compartida del equipo.
          </p>
        </div>
        <Button href="/app/" variant="ghost" arrow>
          Adaptar otro CV
        </Button>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Postulaciones" value={rows ? String(total) : "…"} index={0} />
        <Kpi
          label="Con respuesta"
          value={rows && total ? `${Math.round((conRespuesta / total) * 100)}%` : rows ? "0%" : "…"}
          hint={rows ? `${conRespuesta} de ${total}` : undefined}
          index={1}
        />
        <Kpi label="Entrevistas activas" value={rows ? String(entrevistas) : "…"} index={2} />
        <Kpi label="Match medio" value={rows ? String(matchMedio) : "…"} index={3} />
      </div>

      {/* Tabla */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Todas las postulaciones</h2>
          <Pill tone="accent">Alta automática al marcar enviada</Pill>
        </div>

        {error && (
          <div className="px-5 py-14 text-center text-sm text-muted">
            No pude cargar el tracker ahora mismo. Reintenta en unos segundos.
          </div>
        )}

        {!error && rows === null && (
          <div className="space-y-3 p-5" aria-live="polite" aria-label="Cargando postulaciones">
            <div className="skeleton h-9 w-full" />
            <div className="skeleton h-9 w-full" />
            <div className="skeleton h-9 w-full" />
            <div className="skeleton h-9 w-2/3" />
          </div>
        )}

        {!error && rows !== null && rows.length === 0 && (
          <div className="px-5 py-14 text-center text-sm text-muted">
            Aún no hay postulaciones. Adapta tu primer CV y márcalo como enviado.
          </div>
        )}

        {!error && rows !== null && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Empresa</th>
                  <th className="px-5 py-3 font-semibold">Puesto</th>
                  <th className="px-5 py-3 font-semibold">Sector</th>
                  <th className="px-5 py-3 font-semibold">Match</th>
                  <th className="px-5 py-3 font-semibold">Salario</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line/60 transition last:border-0 hover:bg-paper/60">
                    <td className="whitespace-nowrap px-5 py-3 text-muted">{r.fecha}</td>
                    <td className="px-5 py-3 font-medium">{r.empresa}</td>
                    <td className="px-5 py-3 text-muted-2">{r.puesto}</td>
                    <td className="px-5 py-3 text-muted-2">{r.sector}</td>
                    <td className="px-5 py-3 font-semibold tabular-nums">{r.match_score ?? "·"}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted-2">{r.salario}</td>
                    <td className="px-5 py-3">
                      <StatusBadge estado={String(r.estado)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
