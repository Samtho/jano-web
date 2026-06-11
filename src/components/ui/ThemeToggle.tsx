"use client";

import { useEffect, useState } from "react";

// Toggle claro/oscuro. El tema vive en data-theme del <html> y se persiste
// en localStorage; al montar reaplica el guardado (puede haber un parpadeo breve).
export default function ThemeToggle() {
  const [tema, setTema] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const guardado = localStorage.getItem("jano.tema");
    if (guardado === "light" || guardado === "dark") {
      setTema(guardado);
      document.documentElement.dataset.theme = guardado;
    }
  }, []);

  function cambiar() {
    const nuevo = tema === "dark" ? "light" : "dark";
    setTema(nuevo);
    document.documentElement.dataset.theme = nuevo;
    localStorage.setItem("jano.tema", nuevo);
  }

  return (
    <button
      onClick={cambiar}
      aria-label={tema === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={tema === "dark" ? "Tema claro" : "Tema oscuro"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted-2 transition hover:border-accent/40 hover:text-ink"
    >
      {tema === "dark" ? (
        // Sol
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // Luna
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
