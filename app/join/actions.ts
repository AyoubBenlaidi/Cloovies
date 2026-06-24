"use server";

import { redirect } from "next/navigation";
import { joinByCode } from "@/lib/data";

export async function joinAction(formData: FormData) {
  const code = String(formData.get("code") ?? "");
  const community = await joinByCode(code);
  if (!community) {
    redirect(`/join?error=1&code=${encodeURIComponent(code)}`);
  }
  redirect("/accueil");
}
