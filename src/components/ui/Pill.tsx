type Props = {
  children: React.ReactNode;
  tone?: "accent" | "ok" | "danger" | "neutral";
};

const TONES = {
  accent: "bg-tint text-accent-deep border-accent/20",
  ok: "bg-ok-tint text-ok border-ok/20",
  danger: "bg-danger-tint text-danger border-danger/20",
  neutral: "bg-surface text-muted-2 border-line",
};

export default function Pill({ children, tone = "neutral" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
