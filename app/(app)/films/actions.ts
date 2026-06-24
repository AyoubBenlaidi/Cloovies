"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CURRENT_USER_ID,
  addFilm,
  setRating,
  toggleVote,
} from "@/lib/data";

export async function toggleVoteAction(
  moovieId: string,
  filmId: string
): Promise<{ ok: boolean; voted: boolean; reason?: string }> {
  const res = await toggleVote(moovieId, filmId, CURRENT_USER_ID);
  revalidatePath("/films");
  revalidatePath("/accueil");
  return res;
}

export async function rateFilmAction(
  moovieId: string,
  filmId: string,
  score: number
) {
  await setRating({ moovieId, filmId, userId: CURRENT_USER_ID, score });
  revalidatePath(`/films/${filmId}`);
  revalidatePath("/reunion");
}

export async function addFilmAction(formData: FormData) {
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
