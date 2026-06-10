"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

// Envuelve las paginas que requieren sesion. Sin sesion, redirige a /entrar.
export default function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/entrar/");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl items-center justify-center px-5 py-32">
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
          Cargando tu cuenta…
        </div>
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}
