"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addFilm,
  getActiveCommunity,
  getCurrentUserId,
  getMyRole,
  setRating,
  toggleVote,
} from "@/lib/data";
import { getFilmData, searchMovies, type TmdbResult } from "@/lib/tmdb";

/** Garde-fou : les actions admin échouent si l'appelant n'est pas admin. */
async function assertAdmin() {
  const community = await getActiveCommunity();
  const role = await getMyRole(community.id, await getCurrentUserId());
  if (role !== "admin") throw new Error("Action réservée aux administrateurs.");
}

export async function toggleVoteAction(
  moovieId: string,
  filmId: string
): Promise<{ ok: boolean; voted: boolean; reason?: string }> {
  const res = await toggleVote(moovieId, filmId, await getCurrentUserId());
  revalidatePath("/films");
  revalidatePath("/accueil");
  return res;
}

export async function rateFilmAction(
  moovieId: string,
  filmId: string,
  score: number
) {
  await setRating({
    moovieId,
    filmId,
    userId: await getCurrentUserId(),
    score,
  });
  revalidatePath(`/films/${filmId}`);
  revalidatePath("/reunion");
}

/** Recherche TMDB. Renvoie un résultat structuré pour gérer l'UI. */
export async function searchTmdbAction(
  query: string
): Promise<{ ok: boolean; results: TmdbResult[]; error?: string }> {
  try {
    const results = await searchMovies(query);
    return { ok: true, results };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "TMDB_NOT_CONFIGURED")
      return { ok: false, results: [], error: "Import TMDB non configuré." };
    if (msg.includes("401"))
      return { ok: false, results: [], error: "Clé TMDB invalide ou expirée." };
    return { ok: false, results: [], error: "TMDB indisponible, réessayez." };
  }
}

/** Ajoute un film à partir d'un résultat TMDB — récupère la fiche complète. */
export async function addFilmFromTmdbAction(moovieId: string, tmdbId: number) {
  await assertAdmin();
  const data = await getFilmData(tmdbId);
  await addFilm({ moovieId, ...data });
  revalidatePath("/films");
  redirect("/films");
}

export async function addFilmAction(formData: FormData) {
  await assertAdmin();
  const moovieId = String(formData.get("moovieId"));
  await addFilm({
    moovieId,
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    tagline: null,
    posterUrl: (String(formData.get("posterUrl") ?? "").trim() || null) as string | null,
    trailerUrl: (String(formData.get("trailerUrl") ?? "").trim() || null) as string | null,
    year: null,
    runtime: null,
    director: null,
    genres: [],
    tmdbRating: null,
  });
  revalidatePath("/films");
  redirect("/films");
}
