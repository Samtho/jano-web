import { supabase } from "@/lib/supabase";

// Perfil extendido del usuario (tabla profiles, RLS por usuario).
export type Profile = {
  nombre: string | null;
  telefono: string | null;
  ciudad: string | null;
  linkedin: string | null;
};

export async function getMyProfile(): Promise<Profile | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("nombre, telefono, ciudad, linkedin")
    .eq("id", u.user.id)
    .maybeSingle();
  if (error) return null;
  return (data as Profile) ?? null;
}

export async function updateMyProfile(p: Partial<Profile>): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("No hay sesión.");
  const { error } = await supabase.from("profiles").update(p).eq("id", u.user.id);
  if (error) throw new Error(error.message);
}
