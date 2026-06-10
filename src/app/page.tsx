"use client";

import Button from "@/components/ui/Button";
import CountUp from "@/components/ui/CountUp";
import Pill from "@/components/ui/Pill";
import ScoreRing from "@/components/ui/ScoreRing";
import Spotlight from "@/components/ui/Spotlight";
import { useReveal } from "@/lib/useReveal";

const STACK = [
  "RAG con embeddings",
  "Supabase pgvector",
  "Agentes con guardarraíl",
  "n8n cloud",
  "OpenAI",
  "Next.js",
  "Similitud coseno ≥ 0.4",
  "Trazabilidad por bullet",
  "Memoria persistente",
];

function MarqueeBand() {
  const items = [...STACK, ...STACK];
  return (
    <div className="overflow-hidden border-y border-line bg-surface/60 py-3.5" aria-hidden>
      <div className="marquee-track gap-10 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {items.map((s, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            {s} <span className="text-accent">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  useReveal();

  return (
    <>
      {/* ===== Hero con spotlight + aurora ===== */}
      <Spotlight className="relative overflow-hidden">
        <div className="aurora aurora-a -top-24 left-[8%] h-96 w-96" />
        <div className="aurora aurora-b top-40 right-[2%] h-80 w-80" />

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 text-center md:pt-28">
          <div className="fade-up" style={{ "--i": 0 } as React.CSSProperties}>
            <Pill tone="accent">Agente RAG · sin invención · auditable</Pill>
          </div>
          <h1
            className="fade-up mx-auto mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-8xl"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            Tu CV, adaptado a cada oferta.
            <br />
            <span className="text-gradient">Sin inventar nada.</span>
          </h1>
          <p
            className="fade-up mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-2"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            Jano convierte tu experiencia real en una base de hechos, mide el match con matemática
            (no con opiniones) y redacta un CV donde cada línea se puede auditar con un clic.
          </p>
          <div className="fade-up mt-9 flex flex-wrap items-center justify-center gap-3" style={{ "--i": 3 } as React.CSSProperties}>
            <span className="btn-shine inline-flex">
              <Button href="/app/" arrow>
                Adaptar mi CV gratis
              </Button>
            </span>
            <Button href="/como-funciona/" variant="ghost">
              Ver cómo funciona
            </Button>
          </div>
          <p className="fade-up mt-4 text-xs text-muted" style={{ "--i": 4 } as React.CSSProperties}>
            Menos de 1 minuto · sin registro · tu archivo no sale de tu navegador
          </p>
        </div>
      </Spotlight>

      <MarqueeBand />

      {/* ===== Bento: el producto enseñándose a sí mismo ===== */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="reveal font-display text-3xl font-semibold tracking-tight md:text-5xl">
          No te lo contamos.
          <br />
          <span className="text-gradient">Te lo enseñamos.</span>
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {/* Match honesto (grande) */}
          <div className="reveal glass glow-border rounded-3xl p-8 md:col-span-2 md:row-span-2" style={{ "--i": 0 } as React.CSSProperties}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold">Match honesto, en segundos</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-2">
                  Cada requisito se busca en tu base de hechos con embeddings. Si la similitud no
                  supera 0.4, no cuenta. El veredicto es matemático.
                </p>
              </div>
              <Pill tone="ok">guardarraíl activo</Pill>
            </div>
            <div className="mt-6 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
              <ScoreRing value={86} size={180} />
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 rounded-xl bg-ok-tint px-3.5 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-ok" />
                  Magento multi-región
                  <span className="ml-auto font-semibold text-ok">0.81 · cubierto</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-ok-tint px-3.5 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-ok" />
                  Metodologías ágiles (Scrum)
                  <span className="ml-auto font-semibold text-ok">0.74 · cubierto</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-danger-tint px-3.5 py-2.5">
                  <span className="h-2 w-2 rounded-full border-2 border-danger" />
                  Italiano profesional
                  <span className="ml-auto font-semibold text-danger">0.22 · pregunta</span>
                </div>
                <p className="pt-1 text-[11px] leading-relaxed text-muted">
                  Lo que no cubres no se rellena: se convierte en una pregunta para ti.
                </p>
              </div>
            </div>
          </div>

          {/* Trazabilidad */}
          <div className="reveal glass rounded-3xl p-7" style={{ "--i": 1 } as React.CSSProperties}>
            <h3 className="font-display text-xl font-semibold">Cada bullet, auditable</h3>
            <div className="mt-4 rounded-xl bg-surface-2 p-3.5 text-xs leading-relaxed">
              &ldquo;Lidero el canal ecommerce global con 22 sitios Magento&rdquo;
            </div>
            <div className="mt-2 rounded-xl border border-accent/30 bg-tint p-3.5 text-[11px] leading-relaxed text-muted-2">
              <span className="font-semibold text-accent-deep">ORIGEN VERIFICADO</span>
              <br />
              Product Owner del canal ecommerce Galileo en Giunti: 22 sitios Magento en 4 regiones.
            </div>
          </div>

          {/* Memoria que crece */}
          <div className="reveal glass rounded-3xl p-7" style={{ "--i": 2 } as React.CSSProperties}>
            <h3 className="font-display text-xl font-semibold">Tu score sube en vivo</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-2">
              Responde un hueco real y recalcula. La base de hechos crece contigo.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="font-display text-4xl font-semibold text-muted line-through decoration-2">43</span>
              <span className="text-accent">→</span>
              <span className="font-display text-5xl font-semibold text-ok">86</span>
              <Pill tone="ok">+43</Pill>
            </div>
          </div>

          {/* IA que reescribe sin inventar */}
          <div className="reveal glass rounded-3xl p-7" style={{ "--i": 0 } as React.CSSProperties}>
            <h3 className="font-display text-xl font-semibold">✦ Reescribe sin inventar</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-2">
              ¿No te gusta un bullet? Pide 3 redacciones alternativas. Todas ancladas al mismo
              hecho: cambiar la voz sí, inventar no.
            </p>
          </div>

          {/* Cualquier formato */}
          <div className="reveal glass rounded-3xl p-7" style={{ "--i": 1 } as React.CSSProperties}>
            <h3 className="font-display text-xl font-semibold">PDF, Word o un enlace</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-2">
              El CV se lee en tu navegador (no se sube). La oferta, pegada o desde URL, con doble
              vía de lectura si el sitio bloquea.
            </p>
          </div>

          {/* Tracker */}
          <div className="reveal glass rounded-3xl p-7" style={{ "--i": 2 } as React.CSSProperties}>
            <h3 className="font-display text-xl font-semibold">Cierra el ciclo</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-2">
              Marcar enviada crea la fila en tu tracker con el score. KPIs en vivo, cero doble
              entrada.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="border-y border-line bg-surface/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-14 text-center md:grid-cols-4">
          {[
            { v: 10, suffix: "s", label: "de oferta a score" },
            { v: 100, suffix: "%", label: "de bullets con origen" },
            { v: 3, suffix: "", label: "alternativas por bullet" },
            { v: 0, suffix: "", label: "datos inventados, por diseño" },
          ].map((s, i) => (
            <div key={s.label} className="reveal" style={{ "--i": i } as React.CSSProperties}>
              <p className="font-display text-5xl font-semibold text-gradient">
                {s.v === 10 ? "~" : ""}
                <CountUp value={s.v} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <Spotlight className="relative overflow-hidden">
        <div className="aurora aurora-a -top-16 left-[20%] h-72 w-72" />
        <div className="aurora aurora-c -bottom-24 right-[12%] h-80 w-80" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-28 text-center">
          <h2 className="reveal font-display text-4xl font-semibold tracking-tight md:text-6xl">
            La próxima oferta
            <br />
            <span className="text-gradient">no espera.</span>
          </h2>
          <p className="reveal max-w-lg text-sm leading-relaxed text-muted-2" style={{ "--i": 1 } as React.CSSProperties}>
            Sube tu CV una vez. Adapta tantas veces como ofertas encuentres. Y registra cada envío
            sin doble entrada.
          </p>
          <span className="reveal btn-shine inline-flex" style={{ "--i": 2 } as React.CSSProperties}>
            <Button href="/app/" arrow>
              Empezar ahora
            </Button>
          </span>
        </div>
      </Spotlight>
    </>
  );
}
