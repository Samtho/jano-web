import { JanoMark } from "@/components/ui/Nav";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row">
        <div className="flex items-center gap-2">
          <JanoMark size={18} />
          <span className="font-medium text-ink">Jano 2.1</span>
          <span>· Atrás y adelante</span>
        </div>
        <p>Nada de lo que ves se inventa: cada bullet tiene origen.</p>
      </div>
    </footer>
  );
}
