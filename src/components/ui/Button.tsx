"use client";

import Link from "next/link";

type Variant = "solid" | "ghost" | "mini";

const STYLES: Record<Variant, string> = {
  solid:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-accent-deep hover:shadow-lift disabled:opacity-50 disabled:pointer-events-none",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:border-accent/40 hover:text-accent-deep disabled:opacity-50 disabled:pointer-events-none",
  mini:
    "inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-deep disabled:opacity-50 disabled:pointer-events-none",
};

type Props = {
  variant?: Variant;
  href?: string;
  arrow?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ variant = "solid", href, arrow, children, ...rest }: Props) {
  const cls = STYLES[variant];
  const inner = (
    <>
      {children}
      {arrow && <span className="btn-arrow">→</span>}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
  );
}
