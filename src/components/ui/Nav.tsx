"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import ThemeToggle from "@/components/ui/ThemeToggle";

const APP_LINKS = [
  { href: "/app/", label: "Adaptar CV" },
  { href: "/tracker/", label: "Tracker" },
  { href: "/como-funciona/", label: "Cómo funciona" },
];
const PUBLIC_LINKS = [{ href: "/como-funciona/", label: "Cómo funciona" }];

// Logotipo Jano: las dos caras (atras y adelante).
export function JanoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="1" y="1" width="38" height="38" rx="10" fill="#4f46e5" />
      <path d="M15 13 l-5 7 l5 7" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 13 l5 7 l-5 7" stroke="#c7d2fe" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cerrar el menu movil al navegar.
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  // La pantalla de entrada va a pantalla completa, sin nav.
  if (pathname?.startsWith("/entrar")) return null;

  const links = user ? APP_LINKS : PUBLIC_LINKS;
  const nombre = (user?.user_metadata?.nombre as string) || user?.email?.split("@")[0];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3">
          <JanoMark />
          <span className="font-display text-xl font-semibold tracking-tight">
            Jano<span className="text-accent">.</span>
          </span>
          <span className="hidden rounded-full border border-accent/30 bg-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-accent-deep sm:inline">
            2.1
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => {
            const active = pathname?.startsWith(l.href.replace(/\/$/, ""));
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`hidden rounded-lg px-3 py-2 font-medium transition-colors sm:block ${
                  active ? "bg-tint text-accent-deep" : "text-muted-2 hover:bg-surface hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <div className="ml-1">
            <ThemeToggle />
          </div>
          {user ? (
            <div className="ml-2 flex items-center gap-2">
              <Link
                href="/cuenta/"
                aria-current={pathname?.startsWith("/cuenta") ? "page" : undefined}
                className={`hidden items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors sm:flex ${
                  pathname?.startsWith("/cuenta") ? "bg-tint text-accent-deep" : "text-muted-2 hover:bg-surface hover:text-ink"
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold uppercase text-white">
                  {(nombre ?? "?").charAt(0)}
                </span>
                <span className="hidden max-w-[120px] truncate md:inline">{nombre}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="hidden rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted-2 transition hover:border-accent/40 hover:text-ink sm:block"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              href="/entrar/"
              className="ml-2 rounded-lg bg-accent px-3.5 py-2 font-semibold text-white transition hover:bg-accent-deep"
            >
              Entrar
            </Link>
          )}
          {/* Hamburguesa (solo movil) */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink sm:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuAbierto ? (
                <>
                  <line x1="4" y1="4" x2="14" y2="14" />
                  <line x1="14" y1="4" x2="4" y2="14" />
                </>
              ) : (
                <>
                  <line x1="3" y1="5" x2="15" y2="5" />
                  <line x1="3" y1="9" x2="15" y2="9" />
                  <line x1="3" y1="13" x2="15" y2="13" />
                </>
              )}
            </svg>
          </button>
        </nav>
      </div>

      {/* Menu movil desplegable */}
      {menuAbierto && (
        <div className="border-t border-line bg-paper px-5 py-3 sm:hidden">
          <div className="flex flex-col gap-1 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2.5 font-medium ${
                  pathname?.startsWith(l.href.replace(/\/$/, "")) ? "bg-tint text-accent-deep" : "text-muted-2"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <>
                <Link href="/cuenta/" className="rounded-lg px-3 py-2.5 font-medium text-muted-2">
                  Mi cuenta {nombre ? `(${nombre})` : ""}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="rounded-lg px-3 py-2.5 text-left font-medium text-muted-2"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
