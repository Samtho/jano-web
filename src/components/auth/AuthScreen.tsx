"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { JanoMark } from "@/components/ui/Nav";
import { BASE_PATH } from "@/lib/basePath";

type Modo = "entrar" | "crear";

export default function AuthScreen() {
  const router = useRouter();
  const toast = useToast();
  const { signIn, signUp } = useAuth();

  const [modo, setModo] = useState<Modo>("entrar");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // React no siempre aplica `muted` al DOM, y Chrome bloquea el autoplay si el
  // video no esta muteado. Lo forzamos por codigo y disparamos el play.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {
      /* si el navegador igual lo bloquea, se ve el degradado de respaldo */
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast("Escribe tu email y contraseña.", "error");
      return;
    }
    setBusy(true);
    try {
      if (modo === "entrar") {
        await signIn(email, password);
        toast("Bienvenido de vuelta.", "ok");
        router.push("/app/");
      } else {
        const { needsConfirm } = await signUp(email, password, nombre);
        if (needsConfirm) {
          toast("Cuenta creada. Revisa tu email para confirmarla.", "ok");
          setModo("entrar");
        } else {
          toast("Cuenta creada. Ya estás dentro.", "ok");
          router.push("/app/");
        }
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Algo salió mal.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_1.1fr]">
      {/* IZQUIERDA: formulario */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-3">
            <JanoMark size={36} />
            <span className="font-display text-2xl font-semibold tracking-tight">
              Jano<span className="text-accent">.</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {modo === "entrar" ? "Entrar" : "Crear cuenta"}
          </h1>
          <p className="mt-2 text-sm text-muted-2">
            {modo === "entrar"
              ? "Accede a tu cuenta con email y contraseña."
              : "Guarda tu base de hechos y tus candidaturas en tu cuenta."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {modo === "crear" && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-2" htmlFor="nombre">
                  Nombre
                </label>
                <input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-accent/60"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-accent/60"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-2" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-accent/60"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-shine flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-accent-deep disabled:opacity-50"
            >
              {busy ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
              <span className="btn-arrow">→</span>
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            o
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            onClick={() => setModo(modo === "entrar" ? "crear" : "entrar")}
            className="w-full rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent-deep"
          >
            {modo === "entrar" ? "Crear una cuenta nueva" : "Ya tengo cuenta, entrar"}
          </button>

          <p className="mt-6 text-center text-xs text-muted">
            <Link href="/" className="hover:text-ink">
              ← Volver a Jano
            </Link>
          </p>
        </div>
      </div>

      {/* DERECHA: panel de marca con video (o gradiente de respaldo) */}
      <div className="relative hidden overflow-hidden bg-surface-2 lg:block">
        {/* Gradiente de respaldo: se ve si el video no esta disponible */}
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_70%_20%,rgba(109,111,251,0.35),transparent_60%),radial-gradient(700px_500px_at_30%_90%,rgba(192,132,252,0.22),transparent_60%)]" />
        {/* Video de fondo (lo anades tu en public/auth-hero.mp4) */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={`${BASE_PATH}/auth-hero.mp4`} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090f] via-[#08090f]/30 to-transparent" />

        <div className="relative flex h-full flex-col justify-end p-12">
          <div className="max-w-md rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-deep">Jano</p>
            <p className="mt-2 font-display text-2xl font-semibold leading-snug text-white">
              Tu CV, adaptado a cada oferta. Sin inventar nada.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Match honesto con matemática, no con opiniones. Y cada línea de tu CV, auditable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
