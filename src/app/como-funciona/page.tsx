import type { Metadata } from "next";
import Pill from "@/components/ui/Pill";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Cómo funciona · Jano",
};

// Un paso dentro de un flujo (tarjeta + flecha CSS hacia el siguiente).
function Paso({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <li className="flex items-stretch gap-3">
      <div className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-snug shadow-card">
        {children}
      </div>
      {!last && (
        <span aria-hidden className="hidden items-center font-bold text-accent md:flex">
          →
        </span>
      )}
    </li>
  );
}

function Flujo({
  numero,
  titulo,
  descripcion,
  pasos,
  guardarrail,
}: {
  numero: string;
  titulo: string;
  descripcion: string;
  pasos: string[];
  guardarrail?: string;
}) {
  return (
    <section className="rounded-2xl border border-line bg-paper p-6 md:p-8">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-3xl font-semibold text-accent/30">{numero}</span>
        <h2 className="font-display text-2xl font-semibold">{titulo}</h2>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-2">{descripcion}</p>
      <ol className="mt-5 flex flex-col gap-3 md:flex-row md:items-stretch">
        {pasos.map((p, i) => (
          <Paso key={i} last={i === pasos.length - 1}>
            {p}
          </Paso>
        ))}
      </ol>
      {guardarrail && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-accent/25 bg-tint px-4 py-3">
          <span className="mt-0.5 text-accent" aria-hidden>
            ⛨
          </span>
          <p className="text-sm leading-relaxed text-accent-deep">
            <strong>Guardarraíl:</strong> {guardarrail}
          </p>
        </div>
      )}
    </section>
  );
}

export default function ComoFunciona() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Pill tone="accent">Arquitectura</Pill>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-5xl">
        Cómo funciona <em className="text-accent">Jano</em> por dentro.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-2">
        La web es una fachada estática: todo el motor vive en flujos de n8n sobre una base de datos
        vectorial en Supabase (pgvector). Estos son los cinco procesos, tal cual están construidos.
      </p>

      <div className="mt-10 space-y-6">
        <Flujo
          numero="01"
          titulo="Ingesta del CV"
          descripcion="Tu CV se convierte en una base de hechos auditable. El archivo se lee en tu navegador: al motor solo viaja texto."
          pasos={[
            "Subes PDF, DOCX o texto; el navegador extrae el contenido",
            "Un LLM trocea el texto en hechos: texto + origen + categoria",
            "Cada hecho se convierte en un vector (embeddings de OpenAI)",
            "Se guardan en Supabase (tabla documents) bajo tu identificador",
          ]}
          guardarrail="Solo entra lo que está en tu CV. La extracción no añade, no completa y no adorna."
        />
        <Flujo
          numero="02"
          titulo="Match con la oferta"
          descripcion="Cada requisito de la oferta se busca en tu base de hechos por similitud semántica, no por palabras clave."
          pasos={[
            "Un LLM extrae los requisitos y los clasifica por categoría",
            "Cada requisito se vectoriza y se busca el hecho más cercano",
            "Un requisito solo cuenta como cubierto si la similitud supera 0.4",
            "Score 0-100 ponderado: experiencia 30, habilidades 30, perfil 20, idiomas 10, otros 10",
          ]}
          guardarrail="Sin hecho que lo respalde, un requisito jamás se da por cubierto. El umbral es matemático, no opinión del modelo."
        />
        <Flujo
          numero="03"
          titulo="Ciclo de huecos"
          descripcion="Lo que no cubres se convierte en preguntas. Tus respuestas hacen crecer la base: es la memoria del agente."
          pasos={[
            "Cada requisito no cubierto aparece como una pregunta",
            "Respondes solo lo que sea real, con contexto",
            "La respuesta se guarda como hecho nuevo (vectorizado, con origen)",
            "Recalculas el match: el score sube delante de ti",
          ]}
          guardarrail="Si no tienes la experiencia, lo dejas vacío. Jano nunca rellena un hueco por su cuenta."
        />
        <Flujo
          numero="04"
          titulo="CV adaptado"
          descripcion="Un agente redacta el CV para esa oferta usando únicamente tus hechos, y cita de dónde sale cada línea."
          pasos={[
            "Se leen todos tus hechos de la base",
            "El agente selecciona, reordena y reformula solo esos hechos",
            "Cada bullet lleva el campo origen con el hecho literal que lo respalda",
            "Haces clic en un bullet y auditas su origen al instante",
          ]}
          guardarrail="Generativo con cita: puede reformular, pero no puede afirmar nada que no esté en un hecho."
        />
        <Flujo
          numero="05"
          titulo="Tracker"
          descripcion="Marcar enviada crea la fila automáticamente en la base compartida del equipo. Cero doble entrada."
          pasos={[
            "Pulsas Marcar como enviada con empresa y puesto",
            "n8n inserta la postulación con el score del match",
            "El panel lee la misma tabla y calcula los KPIs en vivo",
            "El resto del equipo (capa C) consume la misma tabla para avisos y dashboard",
          ]}
        />
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="flex-1">
          <h2 className="font-display text-xl font-semibold">¿Quieres verlo en acción?</h2>
          <p className="mt-1 text-sm text-muted-2">
            Sube tu CV y compruébalo con una oferta real. Tarda menos de un minuto.
          </p>
        </div>
        <Button href="/app/" arrow>
          Adaptar mi CV
        </Button>
      </div>
    </div>
  );
}
