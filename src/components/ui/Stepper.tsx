"use client";

type Props = {
  steps: string[];
  current: number; // 1-based
  maxReached: number;
  onGo: (n: number) => void;
};

export default function Stepper({ steps, current, maxReached, onGo }: Props) {
  return (
    <ol className="grid grid-cols-5 gap-2" aria-label="Pasos del asistente">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        const reachable = n <= maxReached;
        return (
          <li key={label}>
            <button
              onClick={() => reachable && onGo(n)}
              disabled={!reachable}
              aria-current={active ? "step" : undefined}
              className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                active
                  ? "border-accent bg-tint text-accent-deep"
                  : done
                  ? "border-line bg-surface text-ink hover:border-accent/40"
                  : reachable
                  ? "border-line bg-surface text-muted hover:border-accent/40"
                  : "cursor-not-allowed border-line bg-paper text-muted/50"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  done ? "bg-ok text-white" : active ? "bg-accent text-white" : "bg-line text-muted-2"
                }`}
              >
                {done ? "✓" : n}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
