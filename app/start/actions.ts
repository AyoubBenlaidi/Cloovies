"use server";

import { redirect } from "next/navigation";
import type { Community } from "@/lib/data/types";
import { createCommunity, getCurrentUserId } from "@/lib/data";
import { writeActiveCommunityId } from "@/lib/community/cookie";
import { evaluateBadges } from "@/lib/badges/evaluator";

function generateCode(): string {
  return `CINE-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function createCommunityAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim() || "Mon club";
  let community: Community;
  try {
    community = await createCommunity(name, generateCode());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur inconnue";
    redirect(`/start?error=${encodeURIComponent(msg)}`);
  }
  // On arrive directement sur le club qu'on vient de créer.
  await writeActiveCommunityId(community.id);
  try {
    await evaluateBadges(await getCurrentUserId());
  } catch {
    // Pas bloquant.
  }
  redirect("/accueil");
}
