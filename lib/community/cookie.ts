import { cookies } from "next/headers";

/* ============================================================
   Club actif — mémorisé dans un cookie.
   Un utilisateur peut appartenir à plusieurs clubs ; ce cookie
   indique lequel est affiché. La lecture est possible partout
   (Server Components) ; l'écriture/suppression UNIQUEMENT depuis
   une Server Action ou un Route Handler.
   ============================================================ */
export const ACTIVE_COMMUNITY_COOKIE = "cinoche.club";

export async function readActiveCommunityId(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACTIVE_COMMUNITY_COOKIE)?.value ?? null;
}

export async function writeActiveCommunityId(id: string): Promise<void> {
  const store = await cookies();
  store.set(ACTIVE_COMMUNITY_COOKIE, id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearActiveCommunityId(): Promise<void> {
  const store = await cookies();
  store.delete(ACTIVE_COMMUNITY_COOKIE);
}
