/* ============================================================
   Cloovies — Évaluateur de badges (côté serveur).
   À appeler après chaque action significative. Fail-soft :
   ne propage jamais d'erreur au flux principal.
   ============================================================ */

import "server-only";
import { cookies } from "next/headers";
import {
  getBadgeSignals,
  getMyBadges,
  unlockBadges,
} from "@/lib/data";
import { BADGES, BADGE_BY_KEY, type BadgeDef, type BadgeSignals } from "./catalog";

const COOKIE_NAME = "cloovies_new_badges";

/**
 * Évalue tous les badges pour `userId`, persiste les nouveaux déblocages,
 * et dépose dans un cookie la liste des keys fraîchement gagnés (consommée
 * par le toast d'unlock dans le layout).
 */
export async function evaluateBadges(userId: string): Promise<BadgeDef[]> {
  try {
    const [signalsRaw, already] = await Promise.all([
      getBadgeSignals(userId),
      getMyBadges(userId),
    ]);

    const alreadySet = new Set(already.map((b) => b.key));

    // Premier passage : badges non cumulatifs (sans `unlockedCount`).
    const signals: BadgeSignals = { ...signalsRaw, unlockedCount: alreadySet.size };
    const firstPass = BADGES.filter(
      (b) => !alreadySet.has(b.key) && safeCheck(b, signals)
    );
    const firstPassKeys = firstPass.map((b) => b.key);
    for (const k of firstPassKeys) alreadySet.add(k);

    // Deuxième passage : badges qui dépendent du nombre total de déblocages.
    signals.unlockedCount = alreadySet.size;
    const secondPass = BADGES.filter(
      (b) => !alreadySet.has(b.key) && safeCheck(b, signals)
    );
    for (const b of secondPass) alreadySet.add(b.key);

    const newlyUnlocked = [...firstPass, ...secondPass];
    if (newlyUnlocked.length === 0) return [];

    await unlockBadges(
      userId,
      newlyUnlocked.map((b) => b.key)
    );

    // Signal au layout : dépose les keys dans un cookie court.
    try {
      const store = await cookies();
      const existing = store.get(COOKIE_NAME)?.value;
      const queue = existing ? existing.split(",").filter(Boolean) : [];
      const merged = [...new Set([...queue, ...newlyUnlocked.map((b) => b.key)])];
      store.set(COOKIE_NAME, merged.join(","), {
        maxAge: 60,
        path: "/",
        sameSite: "lax",
      });
    } catch {
      // cookies() peut échouer si appelé hors contexte requête — on ignore.
    }

    return newlyUnlocked;
  } catch {
    // Jamais bloquer le flux principal pour un badge.
    return [];
  }
}

function safeCheck(b: BadgeDef, s: BadgeSignals): boolean {
  try {
    return b.check(s);
  } catch {
    return false;
  }
}

/** Consomme la queue de badges fraîchement débloqués (pour affichage toast). */
export async function consumePendingUnlocks(): Promise<BadgeDef[]> {
  try {
    const store = await cookies();
    const raw = store.get(COOKIE_NAME)?.value;
    if (!raw) return [];
    store.delete(COOKIE_NAME);
    const keys = raw.split(",").filter(Boolean);
    return keys
      .map((k) => BADGE_BY_KEY.get(k))
      .filter((b): b is BadgeDef => !!b);
  } catch {
    return [];
  }
}
