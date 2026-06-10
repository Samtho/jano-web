import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para el navegador (auth de usuarios).
// La URL y la anon key son PUBLICAS por diseno: la proteccion real son las
// politicas RLS de cada tabla (la tabla profiles solo deja ver/editar lo tuyo).
const SUPABASE_URL = "https://khdndkjqwilcgfjeqzaj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZG5ka2pxd2lsY2dmamVxemFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzIyODIsImV4cCI6MjA5NjA0ODI4Mn0.W4ENAm56z4OOBbvZnwg2Mxg6Q1hqpnNQnfdSOaVl_7Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
