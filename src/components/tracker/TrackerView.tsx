"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import CountUp from "@/components/ui/CountUp";
import Pill from "@/components/ui/Pill";
import { useToast } from "@/components/ui/Toast";
import { deletePostulacion, getPostulaciones, updatePostulacion } from "@/lib/api";
import type { Postulacion } from "@/lib/types";

const ESTADOS = [
  { value: "enviada", label: "Enviada", cls: "bg-tint text-accent-deep border-accent/30" },
  { value: "entrevista", label: "Entrevista", cls: "bg-warn-tint text-warn border-warn/30" },
  { value: "oferta", label: "Oferta", cls: "bg-ok-tint text-ok border-ok/30" },
  { value: "rechazo", label: "Rechazo", cls: "bg-danger-tint text-danger border-danger/30" },
  { value: "sin_respuesta", label: "Sin respuesta", cls: "bg-surface-2 text-muted border-line" },
];

function claseEstado(estado: string) {
  return ESTADOS.find((e) => e.value === estado.replace("-", "_"))?.cls ?? ESTADOS[4].cls;
}

// Selector de estado con aspecto de badge: cambiarlo guarda al instante.
function EstadoSelect({ row, onChange }: { row: Postulacion; onChange: (estado: string) => void }) {
  return (
    <select
      value={String(row.estado).replace("-", "_")}
      onChange={(e) => onChange(e.target.value)}
      aria-label={`Estado de ${row.empresa}`}
      className={`cursor-pointer appearance-none rounded-full border px-3 py-1 text-[11px] font-semibold outline-none transition hover:brightness-125 ${claseEstado(String(row.estado))}`}
    >
      {ESTADOS.map((e) => (
        <option key={e.value} value={e.value} className="bg-surface text-ink">
          {e.label}
        </option>
      ))}
    </select>
  );
}

// Celda editable con clic (sector, salario): vacia muestra "añadir".
function CeldaEditable({
  valor,
  placeholder,
  onSave,
}: {
  valor: string;
  placeholder: string;
  onSave: (v: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [v, setV] = useState(valor);

  if (editando) {
    return (
      <input
        autoFocus
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => {
          setEditando(false);
          if (v.trim() && v.trim() !== valor) onSave(v.trim());
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setV(valor);
            setEditando(false);
          }
        }}
        className="w-24 rounded-lg border border-accent/40 bg-surface-2 px-2 py-1 text-xs outline-none"
      />
    );
  }
  return (
    <button
      onClick={() => {
        setV(valor);
        setEditando(true);
      }}
      className={`rounded-lg px-2 py-1 text-left text-xs transition hover:bg-surface-2 ${
        valor ? "text-muted-2" : "italic text-muted/60"
      }`}
    >
      {valor || placeholder}
    </button>
  );
}

function Kpi({ label, value, suffix = "", hint, index }: { label: string; value: number | null; suffix?: string; hint?: string; index: number }) {
  return (
    <div className="reveal glass rounded-2xl p-5 is-visible" style={{ "--i": index } as React.CSSProperties}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-4xl font-semibold">
        {value === null ? "…" : <CountUp value={value} suffix={suffix} />}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default function TrackerView() {
  const toast = useToast();
  const [rows, setRows] = useState<Postulacion[] | null>(null);
  const [filtro, setFiltro] = useState<string>("todas");
  const [error, setError] = useState(false);

  useEffect(() => {
    // El tracker es personal: n8n deriva los CVs del usuario desde su token
    // de sesion (user_cvs via RLS), aqui no hay que pasarle nada.
    (async () => {
      try {
        const data = await getPostulaciones();
        setRows(data);
      } catch {
        setError(true);
      }
    })();
  }, []);

  // Edicion optimista: la UI cambia ya; si el guardado falla, se revierte.
  async function editar(id: string, campos: { estado?: string; sector?: string; salario?: string }) {
    const previas = rows;
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, ...campos } : r)) ?? null);
    try {
      await updatePostulacion({ id, ...campos });
      toast("Guardado", "ok");
    } catch {
      setRows(previas ?? null);
      toast("No pude guardar el cambio. Reintenta.", "error");
    }
  }

  async function borrar(id: string) {
    const previas = rows;
    setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
    try {
      await deletePostulacion({ id });
      toast("Postulación eliminada.", "ok");
    } catch {
      setRows(previas ?? null);
      toast("No pude eliminarla. Reintenta.", "error");
    }
  }

  // KPIs siempre sobre el total; la tabla respeta el filtro por estado.
  const total = rows?.length ?? 0;
  // Hubo comunicacion si el estado paso de "enviada"/"sin respuesta" a cualquier otro.
  const norm = (e: string) => String(e).replace("-", "_");
  const conRespuesta = rows?.filter((r) => ["entrevista", "oferta", "rechazo"].includes(norm(r.estado))).length ?? 0;
  const entrevistas = rows?.filter((r) => norm(r.estado) === "entrevista").length ?? 0;
  const matchMedio = rows && rows.length
    ? Math.round(rows.reduce((acc, r) => acc + (r.match_score ?? 0), 0) / rows.length)
    : 0;
  const filas = rows?.filter((r) => filtro === "todas" || String(r.estado).replace("-", "_") === filtro) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Tu <em className="text-gradient not-italic">panel</em> de búsqueda.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-2">
            Cada CV que marcas como enviado crea una fila aquí. Haz clic en el estado o en cualquier
            celda vacía para actualizarla: se guarda al instante.
          </p>
        </div>
        <Button href="/app/" variant="ghost" arrow>
          Adaptar otro CV
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Postulaciones" value={rows ? total : null} index={0} />
        <Kpi
          label="Con respuesta"
          value={rows ? (total ? Math.round((conRespuesta / total) * 100) : 0) : null}
          suffix="%"
          hint={rows ? `${conRespuesta} de ${total}` : undefined}
          index={1}
        />
        <Kpi label="Entrevistas activas" value={rows ? entrevistas : null} index={2} />
        <Kpi label="Match medio" value={rows ? matchMedio : null} index={3} />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Todas las postulaciones</h2>
          <Pill tone="accent">Edición en línea · guarda al instante</Pill>
        </div>

        {/* Filtros por estado */}
        {rows !== null && rows.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-line px-5 py-3">
            {[
              { v: "todas", l: "Todas" },
              ...ESTADOS.map((e) => ({ v: e.value, l: e.label })),
            ].map((f) => (
              <button
                key={f.v}
                onClick={() => setFiltro(f.v)}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                  filtro === f.v
                    ? "border-accent/40 bg-tint text-accent-deep"
                    : "border-line text-muted-2 hover:border-accent/30 hover:text-ink"
                }`}
              >
                {f.l}
                {f.v !== "todas" && (
                  <span className="ml-1 opacity-60">
                    {rows.filter((r) => String(r.estado).replace("-", "_") === f.v).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="px-5 py-14 text-center text-sm text-muted">
            No pude cargar el tracker ahora mismo. Reintenta en unos segundos.
          </div>
        )}

        {!error && rows === null && (
          <div className="space-y-3 p-5" aria-live="polite" aria-label="Cargando postulaciones">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-2/3" />
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
                  <tr key={r.id} className="border-b border-line/60 transition last:border-0 hover:bg-surface-2/60">
                    <td className="whitespace-nowrap px-5 py-3 text-muted">{r.fecha}</td>
                    <td className="px-5 py-3 font-medium">{r.empresa}</td>
                    <td className="max-w-xs truncate px-5 py-3 text-muted-2">{r.puesto}</td>
                    <td className="px-3 py-2">
                      <CeldaEditable
                        valor={r.sector ?? ""}
                        placeholder="+ añadir"
                        onSave={(v) => editar(r.id, { sector: v })}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`font-display text-base font-semibold ${
                          (r.match_score ?? 0) >= 70 ? "text-ok" : (r.match_score ?? 0) >= 45 ? "text-accent-deep" : "text-danger"
                        }`}
                      >
                        {r.match_score ?? "·"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <CeldaEditable
                        valor={r.salario ?? ""}
                        placeholder="+ añadir"
                        onSave={(v) => editar(r.id, { salario: v })}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <EstadoSelect row={r} onChange={(estado) => editar(r.id, { estado })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        Misma tabla que consume el resto del equipo (capa C): lo que edites aquí lo ven sus
        automatizaciones.
      </p>
    </div>
  );
}
