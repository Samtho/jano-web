import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import ScoreRing from "@/components/ui/ScoreRing";

const PASOS = [
  {
    n: "01",
    titulo: "Sube tu CV, en el formato que sea",
    texto:
      "PDF, Word o texto pegado. Jano lo convierte en una base de hechos auditable: experiencia, skills, educación y logros, cada uno con su origen.",
  },
  {
    n: "02",
    titulo: "Pega la oferta (o su enlace)",
    texto:
      "Jano extrae los requisitos, los clasifica por categoría y los busca en tu base de hechos con búsqueda semántica real, no por palabras clave.",
  },
  {
    n: "03",
    titulo: "Match honesto y CV adaptado",
    texto:
      "Un score 0-100 ponderado por categorías. Respondes los huecos reales, ves subir tu score y Jano redacta tu CV bullet a bullet, con origen.",
  },
];

const PRINCIPIOS = [
  {
    titulo: "Guardarraíl anti-invención",
    texto:
      "Un requisito solo cuenta como cubierto si un hecho real lo respalda con similitud matemática. Si falta, Jano pregunta. Nunca rellena.",
  },
  {
    titulo: "Trazabilidad por bullet",
    texto:
      "Cada línea del CV adaptado apunta al hecho exacto del que sale. Haz clic en cualquier bullet y audita su origen literal.",
  },
  {
    titulo: "Memoria que crece",
    texto:
      "Cada hueco que respondes se guarda como un hecho nuevo. El siguiente match lo aprovecha: tu score sube delante de ti.",
  },
];

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
    <div className="overflow-hidden border-y border-line bg-surface py-3.5" aria-hidden>
      <div className="marquee-track gap-10 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {items.map((s, i) => (
          <span key={i} className="flex items-center gap-10">
            {s} <span className="text-accent">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      {/* Hero con aurora */}
      <section className="relative overflow-hidden">
        <div className="aurora aurora-a -top-24 left-[8%] h-96 w-96" />
        <div className="aurora aurora-b top-32 right-[5%] h-80 w-80" />
        <div className="aurora aurora-c -bottom-20 left-[40%] h-72 w-72" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-16 md:grid-cols-[1.15fr_0.85fr] md:pt-24">
          <div>
            <div className="fade-up" style={{ "--i": 0 } as React.CSSProperties}>
              <Pill tone="accent">Agente RAG · sin invención · auditable</Pill>
            </div>
            <h1
              className="fade-up mt-5 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              Tu CV, adaptado
              <br />a cada oferta.
              <br />
              <span className="text-gradient">Sin inventar nada.</span>
            </h1>
            <p
              className="fade-up mt-6 max-w-xl text-lg leading-relaxed text-muted-2"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              Jano mira atrás (lo que ya hiciste) y adelante (lo que pide la oferta). Match honesto
              con embeddings, preguntas solo por los huecos reales y un CV donde cada bullet se
              audita con un clic.
            </p>
            <div className="fade-up mt-8 flex flex-wrap items-center gap-3" style={{ "--i": 3 } as React.CSSProperties}>
              <span className="btn-shine inline-flex rounded-xl">
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

          {/* Tarjeta demo del producto */}
          <div className="fade-up" style={{ "--i": 2 } as React.CSSProperties}>
            <div className="rounded-3xl border border-line bg-surface/90 p-7 shadow-lift backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Match en vivo
                </span>
                <Pill tone="ok">+43 → 86 al cerrar huecos</Pill>
              </div>
              <div className="mt-4 flex justify-center">
                <ScoreRing value={86} size={190} />
              </div>
              <div className="mt-5 space-y-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg bg-ok-tint px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-ok" />
                  Experiencia con Magento multi-región
                  <span className="ml-auto font-semibold text-ok">cubierto</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-ok-tint px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-ok" />
                  Metodologías ágiles (Scrum, Kanban)
                  <span className="ml-auto font-semibold text-ok">cubierto</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-danger-tint px-3 py-2">
                  <span className="h-2 w-2 rounded-full border-2 border-danger" />
                  Italiano profesional
                  <span className="ml-auto font-semibold text-danger">pregunta, no relleno</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarqueeBand />

      {/* Como funciona */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Tres pasos. Cero humo.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PASOS.map((p, i) => (
              <div
                key={p.n}
                className="fade-up rounded-2xl border border-line bg-paper p-6 transition hover:-translate-y-1 hover:shadow-lift"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="font-display text-4xl font-semibold text-accent/30">{p.n}</span>
                <h3 className="mt-3 font-display text-xl font-semibold">{p.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-2">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-12 text-center md:grid-cols-4">
          {[
            ["~10s", "de oferta a score"],
            ["0.4", "umbral matemático de cobertura"],
            ["100%", "de bullets con origen auditable"],
            ["0", "datos inventados, por diseño"],
          ].map(([v, l], i) => (
            <div key={l} className="fade-up" style={{ "--i": i } as React.CSSProperties}>
              <p className="font-display text-4xl font-semibold text-accent">{v}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Principios */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Las reglas que Jano no rompe.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PRINCIPIOS.map((p, i) => (
            <div key={p.titulo} className="fade-up" style={{ "--i": i } as React.CSSProperties}>
              <div className="h-1.5 w-10 rounded-full bg-accent" />
              <h3 className="mt-4 font-display text-xl font-semibold">{p.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-2">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden border-t border-line bg-ink text-paper">
        <div className="aurora aurora-a -top-20 left-[15%] h-72 w-72 opacity-25" />
        <div className="aurora aurora-c -bottom-24 right-[10%] h-80 w-80 opacity-20" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-24 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
            La próxima oferta no espera.
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-paper/70">
            Sube tu CV una vez. Adapta tantas veces como ofertas encuentres. Y registra cada envío
            sin doble entrada.
          </p>
          <span className="btn-shine inline-flex rounded-xl">
            <Button href="/app/" arrow>
              Empezar ahora
            </Button>
          </span>
        </div>
      </section>
    </>
  );
}
