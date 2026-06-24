"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

/* Authentification.
   - Mode démo (sans Supabase) : redirige simplement vers l'app.
   - Avec Supabase : vraie auth email/mot de passe + session par cookies. */

export async function signInAction(formData: FormData) {
  if (isSupabaseConfigured) {
    const sb = await createClient();
    const { error } = await sb.auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/accueil");
}

export async function signUpAction(formData: FormData) {
  if (isSupabaseConfigured) {
    const sb = await createClient();
    const { data, error } = await sb.auth.signUp({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      options: { data: { pseudo: String(formData.get("pseudo") ?? "") } },
    });
    if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    // Si la confirmation par email est désactivée → session immédiate → onboarding.
    if (data.session) redirect("/start");
    redirect("/login?check_email=1");
  }
  redirect("/accueil");
}

export async function signOutAction() {
  if (isSupabaseConfigured) {
    const sb = await createClient();
    await sb.auth.signOut();
  }
  redirect("/login");
}
