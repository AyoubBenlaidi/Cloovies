/* Variables Supabase normalisées.
   - trim : supprime espaces / retours-ligne collés par erreur
   - replace(/\/+$/) : supprime tout slash final → évite l'URL
     "https://xxx.supabase.co//auth/v1/..." qui renvoie
     "Invalid path specified in request URL". */

export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

export const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
).trim();

export const isSupabaseConfigured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
