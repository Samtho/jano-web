"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { BASE_PATH } from "@/lib/basePath";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  recovery: boolean; // true cuando el usuario llega desde el email de "olvide mi contrasena"
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nombre: string) => Promise<{ needsConfirm: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  setNewPassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

// Traduce los mensajes de error de Supabase a algo legible en es-ES.
function traducirError(msg: string): string {
  if (/invalid login/i.test(msg)) return "Email o contraseña incorrectos.";
  if (/email not confirmed/i.test(msg)) return "Tu email aún no está confirmado. Revisa tu correo o reenvía la confirmación.";
  if (/already registered|already exists/i.test(msg)) return "Ese email ya tiene cuenta. Inicia sesión.";
  if (/at least 6|password should be/i.test(msg)) return "La contraseña debe tener al menos 6 caracteres.";
  if (/valid email/i.test(msg)) return "Escribe un email válido.";
  if (/rate limit|too many/i.test(msg)) return "Demasiados intentos. Espera un minuto y reintenta.";
  return msg;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(traducirError(error.message));
  }

  async function signUp(email: string, password: string, nombre: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });
    if (error) throw new Error(traducirError(error.message));
    // Si la confirmacion por email esta desactivada, ya hay sesion -> entra directo.
    return { needsConfirm: !data.session };
  }

  async function signOut() {
    await supabase.auth.signOut();
    // Limpiar el estado local: que el siguiente usuario de este navegador
    // no herede el cvId, la oferta ni el CV del anterior.
    try {
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith("jano.")) localStorage.removeItem(k);
      }
    } catch {
      // localStorage no disponible: nada que limpiar
    }
  }

  // "Olvide mi contrasena": envia el email con el enlace de recuperacion.
  async function resetPassword(email: string) {
    const redirectTo = `${window.location.origin}${BASE_PATH}/entrar/`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw new Error(traducirError(error.message));
  }

  async function resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) throw new Error(traducirError(error.message));
  }

  // Fija la contrasena nueva (tras llegar desde el email de recuperacion).
  async function setNewPassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(traducirError(error.message));
    setRecovery(false);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, recovery, signIn, signUp, signOut, resetPassword, resendConfirmation, setNewPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}
