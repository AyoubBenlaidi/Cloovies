/* ============================================================
   Couche d'accès aux données — point d'entrée unique de l'app.
   Aucun composant ne doit importer directement le mock ou Supabase :
   tout passe par "@/lib/data".

   Sélection de la source :
   - Si les variables NEXT_PUBLIC_SUPABASE_URL / ANON_KEY sont présentes
     → adaptateur Supabase (voir lib/data/supabase).
   - Sinon → adaptateur mock (mode démo, données en mémoire).

   Tant que l'adaptateur Supabase n'expose pas toutes les méthodes,
   on reste sur le mock. Le basculement se fait ici, sans toucher l'UI.
   ============================================================ */

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export * from "./mock";
export { CURRENT_USER_ID } from "./mock";
