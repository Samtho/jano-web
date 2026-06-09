const STYLES: Record<string, string> = {
  enviada: "bg-tint text-accent-deep border-accent/20",
  entrevista: "bg-warn-tint text-warn border-warn/20",
  oferta: "bg-ok-tint text-ok border-ok/20",
  rechazo: "bg-danger-tint text-danger border-danger/20",
  sin_respuesta: "bg-surface text-muted border-line",
};

const LABELS: Record<string, string> = {
  enviada: "Enviada",
  entrevista: "Entrevista",
  oferta: "Oferta",
  rechazo: "Rechazo",
  sin_respuesta: "Sin respuesta",
};

export default function StatusBadge({ estado }: { estado: string }) {
  const key = estado.replace("-", "_");
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STYLES[key] ?? STYLES.sin_respuesta}`}>
      {LABELS[key] ?? estado}
    </span>
  );
}
