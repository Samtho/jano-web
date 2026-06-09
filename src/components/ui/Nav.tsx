"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/app/", label: "Adaptar CV" },
  { href: "/tracker/", label: "Tracker" },
  { href: "/como-funciona/", label: "Cómo funciona" },
];

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
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3">
          <JanoMark />
          <span className="font-display text-xl font-semibold tracking-tight">
            Jano<span className="text-accent">.</span>
          </span>
          <span className="hidden rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted sm:inline">
            2.0
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {LINKS.map((l) => {
            const active = pathname?.startsWith(l.href.replace(/\/$/, ""));
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 font-medium transition-colors ${
                  active ? "bg-tint text-accent-deep" : "text-muted-2 hover:bg-surface hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
