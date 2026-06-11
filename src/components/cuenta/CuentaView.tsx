"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Pill from "@/components/ui/Pill";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { deleteMyCv, listMyCvs, type SavedCv } from "@/lib/cvs";
import { getMyProfile, updateMyProfile } from "@/lib/profile";

function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
      <h2 className="font-display text-xl font-semibold">{titulo}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none transition focus:border-accent/60";

export default function CuentaView() {
  const toast = useToast();
  const { user, signOut } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [password, setPassword] = useState("");
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const [cvs, setCvs] = useState<SavedCv[] | null>(null);

  useEffect(() => {
    if (!user) return;
    setNombre((user.user_metadata?.nombre as string) ?? "");
    setEmail(user.email ?? "");
    getMyProfile().then((p) => {
      if (!p) return;
      setTelefono(p.telefono ?? "");
      setCiudad(p.ciudad ?? "");
      setLinkedin(p.linkedin ?? "");
    });
    listMyCvs()
      .then(setCvs)
      .catch(() => setCvs([]));
  }, [user]);

  async function guardarPerfil() {
    setSavingPerfil(true);
    try {
      const cambios: { data?: { nombre: string }; email?: string } = {};
      if (nombre !== (user?.user_metadata?.nombre ?? "")) cambios.data = { nombre };
      const emailCambia = email && email !== user?.email;
      if (emailCambia) cambios.email = email;

      if (cambios.data || cambios.email) {
        const { error } = await supabase.auth.updateUser(cambios);
        if (error) throw new Error(error.message);
      }

      // Perfil extendido: estos datos van a la cabecera del CV descargado.
      await updateMyProfile({
        nombre: nombre || null,
        telefono: telefono || null,
        ciudad: ciudad || null,
        linkedin: linkedin || null,
      });
      if (emailCambia) {
        toast("Te enviamos un email para confirmar el cambio de correo.", "info");
      } else {
        toast("Perfil actualizado.", "ok");
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "No pude guardar el perfil.", "error");
    } finally {
      setSavingPerfil(false);
    }
  }

  async function cambiarPassword() {
    if (password.length < 6) {
      toast("La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }
    setSavingPass(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      setPassword("");
      toast("Contraseña actualizada.", "ok");
    } catch (e) {
      toast(e instanceof Error ? e.message : "No pude cambiar la contraseña.", "error");
    } finally {
      setSavingPass(false);
    }
  }

  async function borrarCv(id: string) {
    try {
      await deleteMyCv(id);
      setCvs((prev) => prev?.filter((c) => c.id !== id) ?? null);
      toast("CV eliminado de tu cuenta.", "ok");
    } catch {
      toast("No pude eliminar el CV.", "error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Mi cuenta</h1>
          <p className="mt-1 text-sm text-muted-2">{user?.email}</p>
        </div>
        <Button variant="ghost" onClick={() => signOut()}>
          Cerrar sesión
        </Button>
      </div>

      <div className="mt-8 space-y-6">
        {/* Perfil */}
        <Card titulo="Perfil">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-2" htmlFor="c-nombre">
              Nombre
            </label>
            <input id="c-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputCls} placeholder="Tu nombre" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-2" htmlFor="c-email">
              Email
            </label>
            <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            <p className="mt-1 text-[11px] text-muted">Cambiar el email requiere confirmarlo por correo.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-2" htmlFor="c-tel">
                Teléfono
              </label>
              <input id="c-tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={inputCls} placeholder="+34 600 000 000" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-2" htmlFor="c-ciudad">
                Ciudad
              </label>
              <input id="c-ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} className={inputCls} placeholder="Madrid, España" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-2" htmlFor="c-linkedin">
                LinkedIn
              </label>
              <input id="c-linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={inputCls} placeholder="linkedin.com/in/usuario" />
            </div>
          </div>
          <p className="text-[11px] text-muted">Estos datos forman la cabecera de tu CV descargado.</p>
          <Button onClick={guardarPerfil} disabled={savingPerfil}>
            {savingPerfil ? "Guardando…" : "Guardar cambios"}
          </Button>
        </Card>

        {/* Seguridad */}
        <Card titulo="Seguridad">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-2" htmlFor="c-pass">
              Nueva contraseña
            </label>
            <input
              id="c-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>
          <Button onClick={cambiarPassword} disabled={savingPass || !password}>
            {savingPass ? "Cambiando…" : "Cambiar contraseña"}
          </Button>
        </Card>

        {/* Mis CVs */}
        <Card titulo="Mis CVs">
          {cvs === null ? (
            <div className="space-y-2">
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-2/3" />
            </div>
          ) : cvs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line p-5 text-center text-sm text-muted">
              Aún no has guardado ningún CV. Sube uno en{" "}
              <a href="/jano-web/app/" className="text-accent-deep hover:underline">
                Adaptar CV
              </a>
              .
            </div>
          ) : (
            <ul className="space-y-2">
              {cvs.map((cv) => (
                <li
                  key={cv.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{cv.nombre}</p>
                    <p className="text-[11px] text-muted">Guardado el {cv.created_at.slice(0, 10)}</p>
                  </div>
                  <button
                    onClick={() => borrarCv(cv.id)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted-2 transition hover:border-danger/40 hover:text-danger"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Pill tone="neutral">Cada CV guarda su propia base de hechos</Pill>
        </Card>
      </div>
    </div>
  );
}
