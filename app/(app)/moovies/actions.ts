"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createMoovie,
  finalizeSelection,
  getActiveCommunity,
  setMoovieStatus,
} from "@/lib/data";
import { assertAdmin } from "@/lib/community/guards";
import type { MoovieStatus } from "@/lib/data/types";

const PHASES: MoovieStatus[] = ["voting", "watching", "meeting", "archived"];

/** Fait avancer le cycle (admin). En clôturant le vote, fige la sélection. */
export async function setMooviePhaseAction(formData: FormData) {
  await assertAdmin();
  const moovieId = String(formData.get("moovieId") ?? "");
  const status = String(formData.get("status") ?? "") as MoovieStatus;
  if (!moovieId || !PHASES.includes(status)) redirect("/accueil");

  // Passage en visionnage = clôture du vote → on fige le top 2.
  if (status === "watching") await finalizeSelection(moovieId);
  await setMoovieStatus(moovieId, status);

  revalidatePath("/accueil");
  revalidatePath("/films");
  revalidatePath("/reunion");
  redirect("/accueil");
}

export async function createMoovieAction(formData: FormData) {
  await assertAdmin();
  const community = await getActiveCommunity();
  const startDate = String(formData.get("startDate"));
  const endDate = String(formData.get("endDate"));
  await createMoovie({
    communityId: community.id,
    name: String(formData.get("name") ?? "").trim(),
    theme: String(formData.get("theme") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    voteDeadline: new Date(String(formData.get("voteDeadline"))).toISOString(),
  });
  revalidatePath("/accueil");
  revalidatePath("/films");
  redirect("/accueil");
}
