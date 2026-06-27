#!/usr/bin/env node
/**
 * Supprime proprement un utilisateur du Club Cinoche à partir de son email.
 *
 * Étapes :
 *   1. Aperçu (lecture seule) de ce qui sera supprimé/transféré.
 *   2. (--yes) Traite les clubs FONDÉS par l'utilisateur :
 *        transfert à un autre admin/membre, ou suppression si orphelin.
 *   3. (--yes) Supprime le compte via l'Admin API Supabase → cascade
 *        sur profiles et toutes les données personnelles.
 *
 * Pré-requis (env ou .env.local) :
 *   NEXT_PUBLIC_SUPABASE_URL   = https://<ref>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  = <clé service_role>   (JAMAIS exposée au client)
 *
 * La migration supabase/migrations/0004_admin_delete_user.sql doit être appliquée.
 *
 * Usage :
 *   node scripts/delete-user.mjs membre@exemple.com          # aperçu seul
 *   node scripts/delete-user.mjs membre@exemple.com --yes    # suppression définitive
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Charge .env.local / .env (best-effort) si non déjà défini dans l'environnement.
for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
      }
    }
  } catch {
    /* fichier absent : on ignore */
  }
}

const email = process.argv[2];
const confirm = process.argv.includes("--yes");

if (!email || email.startsWith("--")) {
  console.error("Usage : node scripts/delete-user.mjs <email> [--yes]");
  process.exit(1);
}

const url = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ""
).trim();
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

if (!url || !serviceKey) {
  console.error(
    "Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1) Aperçu
const { data: preview, error: pErr } = await sb.rpc(
  "admin_preview_user_deletion",
  { p_email: email }
);
if (pErr) {
  console.error("Aperçu impossible :", pErr.message);
  process.exit(1);
}
if (!preview?.ok) {
  console.error(`Utilisateur introuvable pour « ${email} ».`);
  process.exit(1);
}
console.log("\n=== Aperçu de la suppression ===");
console.log(JSON.stringify(preview, null, 2));

if (!confirm) {
  console.log(
    "\nℹ️  Aperçu uniquement. Relancez avec --yes pour SUPPRIMER définitivement."
  );
  process.exit(0);
}

// 2) Traiter les clubs fondés (transfert / suppression) — sans toucher auth.users
const { data: prep, error: prepErr } = await sb.rpc(
  "admin_prepare_user_deletion",
  { p_email: email }
);
if (prepErr || !prep?.ok) {
  console.error("Préparation échouée :", prepErr?.message ?? "raison inconnue");
  process.exit(1);
}

// 3) Supprimer le compte via l'Admin API → cascade profiles + données
const { error: delErr } = await sb.auth.admin.deleteUser(prep.user_id);
if (delErr) {
  console.error("Suppression du compte échouée :", delErr.message);
  process.exit(1);
}

console.log("\n✅ Utilisateur supprimé proprement.");
console.log(
  JSON.stringify(
    {
      email: preview.email,
      user_id: prep.user_id,
      communities_transferred: prep.communities_transferred,
      communities_deleted: prep.communities_deleted,
    },
    null,
    2
  )
);
