"use client";

import { useRef, useState } from "react";

type Props = {
  onFile: (file: File) => void;
  busy?: boolean;
};

export default function FileDrop({ onFile, busy }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Subir CV: PDF, DOCX o TXT"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
        over ? "border-accent bg-tint" : "border-line bg-surface hover:border-accent/50"
      } ${busy ? "pointer-events-none opacity-60" : ""}`}
    >
      <svg width="40" height="40" viewBox="0 0 64 64" fill="none" stroke="#9aa1ad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="14" y="10" width="36" height="44" rx="6" />
        <line x1="22" y1="24" x2="42" y2="24" />
        <line x1="22" y1="32" x2="42" y2="32" />
        <line x1="22" y1="40" x2="34" y2="40" />
        <circle cx="47" cy="47" r="9" stroke="#4f46e5" />
        <line x1="47" y1="43" x2="47" y2="51" stroke="#4f46e5" />
        <line x1="43" y1="47" x2="51" y2="47" stroke="#4f46e5" />
      </svg>
      <p className="text-sm font-semibold">{busy ? "Leyendo el archivo…" : "Arrastra tu CV aquí o haz clic"}</p>
      <p className="text-xs text-muted">PDF, DOCX o TXT · el texto se extrae en tu navegador</p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md,.doc"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
