"use client";

import { useEffect, useRef } from "react";

// Confetti ligero en canvas (sin dependencias). Se dispara al montar.
// Respeta prefers-reduced-motion: en ese caso no hace nada.
export default function Confetti({ onDone }: { onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone?.();
      return;
    }
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const COLORS = ["#4f46e5", "#818cf8", "#16a34a", "#f59e0b", "#c7d2fe"];
    const N = 110;
    const parts = Array.from({ length: N }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 240,
      y: window.innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 11,
      vy: -(6 + Math.random() * 9),
      size: 5 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
    }));

    let raf = 0;
    const t0 = performance.now();
    const DURATION = 1700;

    const tick = (now: number) => {
      const elapsed = now - t0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const fade = Math.max(0, 1 - elapsed / DURATION);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (elapsed < DURATION) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        onDone?.();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
