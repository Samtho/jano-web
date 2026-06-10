// basePath de la app. Usar SIEMPRE para assets de public/ (ej. el pdf worker).
// Vacio en la raiz (Vercel); "/jano-web" en GitHub Pages (lo fija el workflow
// de deploy con NEXT_PUBLIC_BASE_PATH).
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
