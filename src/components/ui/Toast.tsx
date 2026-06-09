"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastKind = "ok" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; text: string };

const ToastContext = createContext<(text: string, kind?: ToastKind) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const KIND_STYLES: Record<ToastKind, string> = {
  ok: "border-ok/30 bg-ok-tint text-ink",
  error: "border-danger/30 bg-danger-tint text-ink",
  info: "border-line bg-surface text-ink",
};

const KIND_DOT: Record<ToastKind, string> = {
  ok: "bg-ok",
  error: "bg-danger",
  info: "bg-accent",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((text: string, kind: ToastKind = "info") => {
    const id = nextId.current++;
    setItems((prev) => [...prev, { id, kind, text }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      {/* aria-live para que el lector de pantalla anuncie los estados async */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className={`toast-in pointer-events-auto flex max-w-md items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-lift ${KIND_STYLES[t.kind]}`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${KIND_DOT[t.kind]}`} />
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
