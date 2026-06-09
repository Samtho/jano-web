import type { NextConfig } from "next";

// Export estatico para GitHub Pages. basePath incondicional (dev = prod):
// la app vive siempre bajo /jano-web, asi no hay sorpresas al desplegar.
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/jano-web",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
