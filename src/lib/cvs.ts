import { supabase } from "@/lib/supabase";

// CVs guardados por usuario. Cada uno apunta a un cvId (la clave de sus hechos
// en la tabla documents). Las politicas RLS aseguran que solo ves los tuyos.
export type SavedCv = {
  id: string;
  cv_id: string;
  nombre: string;
  created_at: string;
};

export async function listMyCvs(): Promise<SavedCv[]> {
  const { data, error } = await supabase
    .from("user_cvs")
    .select("id, cv_id, nombre, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as SavedCv[]) ?? [];
}

export async function saveMyCv(cvId: string, nombre: string): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("No hay sesión.");
  const { error } = await supabase
    .from("user_cvs")
    .insert({ user_id: u.user.id, cv_id: cvId, nombre });
  if (error) throw new Error(error.message);
}

export async function deleteMyCv(id: string): Promise<void> {
  const { error } = await supabase.from("user_cvs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
