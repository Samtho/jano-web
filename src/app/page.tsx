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
      "Un score 0-100 ponderado por categorías, lo que cubres y lo que no. Respondes los huecos reales y Jano redacta tu CV adaptado, bullet a bullet, con origen.",
  },
];

const PRINCIPIOS = [
  {
    titulo: "Guardarraíl anti-invención",
    texto:
      "El motor solo usa hechos que están en tu CV. Si la oferta pide algo que no tienes, Jano lo expone como pregunta. Nunca lo rellena por su cuenta.",
  },
  {
    titulo: "Trazabilidad por bullet",
    texto:
      "Cada línea del CV adaptado apunta al hecho exacto del que sale. Haz clic en cualquier bullet y verás su origen literal.",
  },
  {
    titulo: "Memoria que crece",
    texto:
      "Cada hueco que respondes se guarda como un hecho nuevo. El siguiente match lo aprovecha: tu score sube delante de ti.",
  },
];

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 md:grid-cols-[1.2fr_0.8fr] md:pt-24">
        <div>
          <div className="fade-up" style={{ "--i": 0 } as React.CSSProperties}>
            <Pill tone="accent">Agente RAG · Supabase pgvector · n8n</Pill>
          </div>
          <h1
            className="fade-up mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            Tu CV, adaptado a cada oferta.
            <br />
            <em className="text-accent">Sin inventar nada.</em>
          </h1>
          <p
            className="fade-up mt-6 max-w-xl text-lg leading-relaxed text-muted-2"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            Jano mira atrás (lo que ya hiciste) y adelante (lo que pide la oferta). Calcula un match
            honesto, te pregunta solo los huecos reales y redacta un CV donde cada bullet se puede
            rastrear hasta tu experiencia original.
          </p>
          <div className="fade-up mt-8 flex flex-wrap gap-3" style={{ "--i": 3 } as React.CSSProperties}>
            <Button href="/app/" arrow>
              Adaptar mi CV
            </Button>
            <Button href="/como-funciona/" variant="ghost">
              Cómo funciona
            </Button>
          </div>
        </div>
        <div className="fade-up flex justify-center" style={{ "--i": 2 } as React.CSSProperties}>
          <div className="rounded-3xl border border-line bg-surface p-10 shadow-card">
            <ScoreRing value={78} size={210} />
            <p className="mt-4 max-w-[210px] text-center text-xs leading-relaxed text-muted">
              Score real calculado con embeddings sobre tu base de hechos. Nada de porcentajes
              decorativos.
            </p>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Tres pasos. Cero humo.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PASOS.map((p, i) => (
              <div
                key={p.n}
                className="fade-up rounded-2xl border border-line bg-paper p-6 transition hover:-translate-y-0.5 hover:shadow-lift"
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

      {/* Principios */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Las reglas que Jano no rompe.
          </h2>
        </div>
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
      <section className="border-t border-line bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-20 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
            La próxima oferta no espera.
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-paper/70">
            Sube tu CV una vez. Adapta tantas veces como ofertas encuentres. Y registra cada envío
            sin doble entrada.
          </p>
          <Button href="/app/" arrow>
            Empezar ahora
          </Button>
        </div>
      </section>
    </>
  );
}
