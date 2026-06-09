"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import { useToast } from "@/components/ui/Toast";

type Props = {
  noCubre: string[];
  respondidos: string[];
  busy: boolean;
  onResponder: (requisito: string, respuesta: string) => Promise<void>;
  onRecalcular: () => void;
  onVolver: () => void;
};

function HuecoCard({
  requisito,
  respondido,
  onResponder,
  index,
}: {
  requisito: string;
  respondido: boolean;
  onResponder: (req: string, resp: string) => Promise<void>;
  index: number;
}) {
  const toast = useToast();
  const [valor, setValor] = useState("");
  const [saving, setSaving] = useState(false);

  async function guardar() {
    if (valor.trim().length < 5) {
      toast("Escribe una respuesta concreta, con contexto.", "error");
      return;
    }
    setSaving(true);
    try {
      await onResponder(requisito, valor.trim());
      toast("Añadido a tu base de hechos", "ok");
    } catch {
      toast("No pude guardar la respuesta. Reintenta.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`fade-up rounded-2xl border p-5 shadow-card transition ${
        respondido ? "border-ok/30 bg-ok-tint" : "border-line bg-surface"
      }`}
      style={{ "--i": index } as React.CSSProperties}
    >
      <p className="text-sm font-semibold">¿Tienes algo real que respalde: {requisito}?</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Si tienes experiencia real, escríbela con contexto. Se añade a tus hechos. Si no la tienes,
        déjalo vacío: Jano no inventa.
      </p>
      {respondido ? (
        <div className="mt-3">
          <Pill tone="ok">Añadido a tus hechos</Pill>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && guardar()}
            placeholder="Ej: 2 anos gestionando campanas B2B en HubSpot…"
            aria-label={`Respuesta para: ${requisito}`}
            className="flex-1 rounded-xl border border-line bg-paper px-3.5 py-2 text-sm outline-none transition focus:border-accent/50"
          />
          <Button variant="mini" onClick={guardar} disabled={saving}>
            {saving ? "Guardando…" : "Añadir a hechos"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function StepHuecos({ noCubre, respondidos, busy, onResponder, onRecalcular, onVolver }: Props) {
  const algunoRespondido = respondidos.length > 0;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        Cerrar <em className="text-accent">huecos</em>.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-2">
        Estos son los requisitos que tu base de hechos no respalda. Responder enriquece tu base, no
        se inventa: cada respuesta se guarda como un hecho nuevo con su origen.
      </p>

      <div className="mt-6 space-y-4">
        {noCubre.map((req, i) => (
          <HuecoCard
            key={req}
            requisito={req}
            respondido={respondidos.includes(req)}
            onResponder={onResponder}
            index={i}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={onVolver}>
          ← Volver al match
        </Button>
        <Button onClick={onRecalcular} disabled={busy || !algunoRespondido} arrow>
          {busy ? "Recalculando…" : "Recalcular match"}
        </Button>
        {!algunoRespondido && (
          <span className="text-xs text-muted">Responde al menos un hueco para recalcular.</span>
        )}
      </div>
    </div>
  );
}
