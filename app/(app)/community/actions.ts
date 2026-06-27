"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUserId, getMyRole } from "@/lib/data";
import { writeActiveCommunityId } from "@/lib/community/cookie";

/** Bascule le club affiché. On ne change que vers un club dont on est membre. */
export async function switchCommunityAction(formData: FormData) {
  const communityId = String(formData.get("communityId") ?? "").trim();
  if (!communityId) redirect("/accueil");

  const role = await getMyRole(communityId, await getCurrentUserId());
  if (!role) redirect("/accueil"); // pas membre → on ignore

  await writeActiveCommunityId(communityId);
  revalidatePath("/", "layout");
  redirect("/accueil");
}
