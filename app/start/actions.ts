"use server";

import { redirect } from "next/navigation";
import { createCommunity, getCurrentUserId } from "@/lib/data";
import { evaluateBadges } from "@/lib/badges/evaluator";

function generateCode(): string {
  return `CINE-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function createCommunityAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim() || "Mon club";
  try {
    await createCommunity(name, generateCode());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur inconnue";
    redirect(`/start?error=${encodeURIComponent(msg)}`);
  }
  try {
    await evaluateBadges(await getCurrentUserId());
  } catch {
    // Pas bloquant.
  }
  redirect("/accueil");
}
