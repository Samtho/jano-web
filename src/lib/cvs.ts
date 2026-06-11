import { supabase } from "@/lib/supabase";

// CVs guardados por usuario. Cada uno apunta a un cvId (la clave de sus hechos
// en la tabla documents). Las politicas RLS aseguran que solo ves los tuyos.
export type SavedCv = {
  id: string;
  cv_id: string;
  nombre: string;
  created_at: string;
  archivo_path: string | null;
};

export async function listMyCvs(): Promise<SavedCv[]> {
  const { data, error } = await supabase
    .from("user_cvs")
    .select("id, cv_id, nombre, created_at, archivo_path")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as SavedCv[]) ?? [];
}

// Guarda el CV en la cuenta; si se subio un archivo, tambien el original
// en Storage (bucket privado, carpeta del usuario) para re-descargarlo luego.
export async function saveMyCv(cvId: string, nombre: string, archivo?: File | null): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("No hay sesión.");

  let archivoPath: string | null = null;
  if (archivo) {
    const ext = archivo.name.split(".").pop() || "pdf";
    archivoPath = `${u.user.id}/${cvId}.${ext}`;
    const { error: errSubida } = await supabase.storage.from("cvs").upload(archivoPath, archivo, {
      upsert: true,
      contentType: archivo.type || "application/octet-stream",
    });
    if (errSubida) archivoPath = null; // el original es opcional: no bloquea el guardado
  }

  const { error } = await supabase
    .from("user_cvs")
    .insert({ user_id: u.user.id, cv_id: cvId, nombre, archivo_path: archivoPath });
  if (error) throw new Error(error.message);
}

// Descarga el archivo original de un CV guardado (URL firmada temporal).
export async function descargarOriginal(cv: SavedCv): Promise<void> {
  if (!cv.archivo_path) throw new Error("Este CV no tiene archivo original guardado.");
  const { data, error } = await supabase.storage.from("cvs").createSignedUrl(cv.archivo_path, 60);
  if (error || !data?.signedUrl) throw new Error("No pude generar el enlace de descarga.");
  const a = document.createElement("a");
  a.href = data.signedUrl;
  a.download = cv.archivo_path.split("/").pop() || "cv.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function deleteMyCv(id: string): Promise<void> {
  const { error } = await supabase.from("user_cvs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function renameMyCv(id: string, nombre: string): Promise<void> {
  const { error } = await supabase.from("user_cvs").update({ nombre }).eq("id", id);
  if (error) throw new Error(error.message);
}
