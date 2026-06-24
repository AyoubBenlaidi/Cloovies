/* Variables Supabase normalisées.

   L'URL doit être l'ORIGINE du projet : https://<ref>.supabase.co
   (sans chemin type /rest/v1, sans slash final, sans espaces).
   On réduit donc toute valeur collée à son origine pour éviter
   "Invalid path specified in request URL" (ex. //auth/v1/... ou
   /rest/v1/auth/v1/...). */

function normalizeUrl(raw: string | undefined): string {
  let v = (raw ?? "").trim();
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) v = "https://" + v; // protocole manquant
  try {
    return new URL(v).origin; // protocole + hôte, rien d'autre
  } catch {
    return v.replace(/\/+$/, "");
  }
}

export const SUPABASE_URL = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);

export const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
).trim();

export const isSupabaseConfigured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
