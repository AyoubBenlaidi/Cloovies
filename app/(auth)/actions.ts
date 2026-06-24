"use server";

import { redirect } from "next/navigation";

/* Authentification — mode démo.
   Avec Supabase configuré, ces actions appelleront supabase.auth.signInWithPassword /
   signUp puis poseront le cookie de session (voir lib/data/supabase). */

export async function signInAction(_formData: FormData) {
  // TODO Supabase: await supabase.auth.signInWithPassword({ email, password })
  redirect("/accueil");
}

export async function signUpAction(_formData: FormData) {
  // TODO Supabase: await supabase.auth.signUp({ email, password, options: { data: { pseudo } } })
  redirect("/accueil");
}
