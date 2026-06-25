"use server";

import { redirect } from "next/navigation";
import { getCurrentUserId, joinByCode } from "@/lib/data";
import { evaluateBadges } from "@/lib/badges/evaluator";

export async function joinAction(formData: FormData) {
  const code = String(formData.get("code") ?? "");
  const community = await joinByCode(code);
  if (!community) {
    redirect(`/join?error=1&code=${encodeURIComponent(code)}`);
  }
  // Au passage : on évalue les badges (Premier Clap, Je suis venu pour les films…).
  try {
    await evaluateBadges(await getCurrentUserId());
  } catch {
    // Mode démo ou pas de session : on ignore.
  }
  redirect("/accueil");
}
