import { getActiveCommunity, getCurrentUserId, getMyRole } from "@/lib/data";

/**
 * Garde-fou serveur : échoue si l'appelant n'est pas admin du club actif.
 * Défense en profondeur en complément de la RLS (côté Supabase).
 */
export async function assertAdmin(): Promise<void> {
  const community = await getActiveCommunity();
  const role = await getMyRole(community.id, await getCurrentUserId());
  if (role !== "admin") {
    throw new Error("Action réservée aux administrateurs.");
  }
}
