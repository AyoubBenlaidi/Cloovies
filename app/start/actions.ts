"use server";

import { redirect } from "next/navigation";
import { createCommunity } from "@/lib/data";

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
  redirect("/accueil");
}
