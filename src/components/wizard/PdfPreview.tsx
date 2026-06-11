"use client";

import { useEffect, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/basePath";
import type { ContactoCv, CvAdaptado } from "@/lib/types";

// Visor del CV: la preview ES el PDF real (mismo blob que la descarga),
// renderizado con pdf.js. Las lineas auditables llevan anotaciones Link con
// una URI propia; aqui se pintan como zonas clicables sobre el canvas.
// Patron validado por Reactive Resume v5.1.0.

export type AuditSel = { perfil: true } | { si: number; bi: number; bu: number };

type Zona = { page: number; left: number; top: number; width: number; height: number; sel: AuditSel };

type PaginaRender = { canvas: HTMLCanvasElement; width: number; height: number };

function parseAuditUrl(url: string): AuditSel | null {
  if (!url.includes("audit.jano.local")) return null;
  if (url.includes("/perfil")) return { perfil: true };
  try {
    const u = new URL(url);
    const si = Number(u.searchParams.get("si"));
    const bi = Number(u.searchParams.get("bi"));
    const bu = Number(u.searchParams.get("bu"));
    if ([si, bi, bu].some((n) => Number.isNaN(n))) return null;
    return { si, bi, bu };
  } catch {
    return null;
  }
}

export default function PdfPreview({
  cv,
  contacto,
  selActiva,
  onAudit,
}: {
  cv: CvAdaptado;
  contacto: ContactoCv;
  selActiva: AuditSel | null;
  onAudit: (sel: AuditSel) => void;
}) {
  const contRef = useRef<HTMLDivElement>(null);
  const [paginas, setPaginas] = useState<PaginaRender[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [generando, setGenerando] = useState(true);
  const genRef = useRef(0);

  useEffect(() => {
    const miGen = ++genRef.current;
    setGenerando(true);
    const t = setTimeout(async () => {
      try {
        // 1) Generar el PDF (mismo documento que la descarga).
        const { generarCvBlob } = await import("@/lib/cvPdf");
        const blob = await generarCvBlob(cv, contacto);
        if (genRef.current !== miGen) return;

        // 2) Renderizarlo con pdf.js.
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `${BASE_PATH}/pdf.worker.min.mjs`;
        const doc = await pdfjs.getDocument({ data: await blob.arrayBuffer() }).promise;
        if (genRef.current !== miGen) return;

        const anchoCont = contRef.current?.clientWidth ?? 640;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const nuevasPaginas: PaginaRender[] = [];
        const nuevasZonas: Zona[] = [];

        for (let p = 1; p <= doc.numPages; p++) {
          const page = await doc.getPage(p);
          const base = page.getViewport({ scale: 1 });
          const escala = anchoCont / base.width;
          const viewport = page.getViewport({ scale: escala * dpr });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport }).promise;

          nuevasPaginas.push({ canvas, width: viewport.width / dpr, height: viewport.height / dpr });

          // 3) Anotaciones Link -> zonas clicables (coordenadas CSS).
          const anots = await page.getAnnotations();
          const vpCss = page.getViewport({ scale: escala });
          for (const a of anots) {
            if (a.subtype !== "Link" || !a.url) continue;
            const sel = parseAuditUrl(String(a.url));
            if (!sel) continue;
            const r = vpCss.convertToViewportRectangle(a.rect as number[]);
            nuevasZonas.push({
              page: p - 1,
              left: Math.min(r[0], r[2]),
              top: Math.min(r[1], r[3]),
              width: Math.abs(r[2] - r[0]),
              height: Math.abs(r[3] - r[1]),
              sel,
            });
          }
        }

        if (genRef.current !== miGen) return;
        setPaginas(nuevasPaginas);
        setZonas(nuevasZonas);
      } catch {
        // si falla la generacion, se mantiene la version anterior
      } finally {
        if (genRef.current === miGen) setGenerando(false);
      }
    }, 250); // debounce: ediciones seguidas no regeneran en cascada
    return () => clearTimeout(t);
  }, [cv, contacto]);

  function esActiva(z: Zona): boolean {
    if (!selActiva) return false;
    if ("perfil" in z.sel) return "perfil" in selActiva;
    if ("perfil" in selActiva) return false;
    return z.sel.si === selActiva.si && z.sel.bi === selActiva.bi && z.sel.bu === selActiva.bu;
  }

  return (
    <div ref={contRef} className="relative">
      {generando && paginas.length === 0 && (
        <div className="space-y-3">
          <div className="skeleton h-[820px] w-full rounded-xl" />
        </div>
      )}
      <div className="space-y-5">
        {paginas.map((pag, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-md bg-white shadow-lift"
            style={{ width: pag.width, height: pag.height }}
            ref={(el) => {
              if (el && pag.canvas.parentElement !== el) {
                el.prepend(pag.canvas);
                pag.canvas.style.width = "100%";
                pag.canvas.style.height = "100%";
                pag.canvas.style.display = "block";
              }
            }}
          >
            {zonas
              .filter((z) => z.page === i)
              .map((z, zi) => (
                <button
                  key={zi}
                  onClick={() => onAudit(z.sel)}
                  aria-label="Auditar esta línea"
                  className={`absolute rounded-sm transition-colors ${
                    esActiva(z) ? "bg-accent/15 ring-1 ring-accent/60" : "hover:bg-accent/10"
                  }`}
                  style={{ left: z.left, top: z.top, width: z.width, height: z.height }}
                />
              ))}
          </div>
        ))}
      </div>
      {generando && paginas.length > 0 && (
        <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-ink/80 px-3 py-1.5 text-[11px] font-semibold text-paper backdrop-blur">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />
          Actualizando…
        </div>
      )}
    </div>
  );
}
