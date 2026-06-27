"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMoovie, getActiveCommunity } from "@/lib/data";
import { assertAdmin } from "@/lib/community/guards";

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
