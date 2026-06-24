import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/** Client Supabase côté serveur (Server Components, Server Actions, Route Handlers).
    Gère la session via les cookies Next.js. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : ignoré (le middleware rafraîchit la session).
          }
        },
      },
    }
  );
}

/** Client à privilèges élevés (opérations serveur sensibles). À n'utiliser QUE côté serveur. */
export async function createAdminClient() {
  const { createClient: createSb } = await import("@supabase/supabase-js");
  return createSb(
    SUPABASE_URL,
    (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim(),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
