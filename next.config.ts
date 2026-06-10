import type { NextConfig } from "next";

// basePath configurable por entorno:
// - GitHub Pages: el workflow de deploy pone NEXT_PUBLIC_BASE_PATH=/jano-web
//   (la app vive bajo /jano-web/).
// - Vercel u otros: sin esa variable, la app vive en la raiz ("/").
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
