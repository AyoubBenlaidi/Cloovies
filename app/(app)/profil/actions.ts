"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId, updateProfile } from "@/lib/data";

export async function updateProfileAction(formData: FormData) {
  const str = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v.length ? v : null;
  };
  await updateProfile(await getCurrentUserId(), {
    pseudo: str("pseudo") ?? "Membre",
    photoUrl: str("photoUrl"),
    favoriteFilm: str("favoriteFilm"),
    favoriteDirector: str("favoriteDirector"),
    favoriteQuote: str("favoriteQuote"),
  });
  revalidatePath("/profil");
  revalidatePath("/accueil");
}
