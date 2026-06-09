import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import { ToastProvider } from "@/components/ui/Toast";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://samtho.github.io/jano-web/"),
  title: "Jano · Tu CV, adaptado a cada oferta. Sin inventar nada.",
  description:
    "Jano convierte tu CV en una base de hechos auditable, calcula el match real con cada oferta y redacta un CV adaptado donde cada bullet es trazable a su origen.",
  icons: { icon: "/jano-web/favicon.svg" },
  openGraph: {
    title: "Jano · Tu CV, adaptado a cada oferta. Sin inventar nada.",
    description:
      "Match honesto con embeddings, ciclo de huecos que hace crecer tu base de hechos y CV adaptado con trazabilidad por bullet.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <ToastProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
