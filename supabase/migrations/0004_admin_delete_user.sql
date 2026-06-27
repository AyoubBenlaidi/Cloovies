-- ============================================================
-- CLUB CINOCHE — Suppression propre d'un utilisateur par email
-- ============================================================
-- Pourquoi un script dédié ?
--   Tout est en ON DELETE CASCADE depuis auth.users → profiles
--   (community_members, votes, ratings, journal_entries, emotions,
--    slot_votes, user_badges) SAUF `communities.created_by`, qui
--   référence profiles SANS cascade. Supprimer un utilisateur qui a
--   FONDÉ un club échouerait donc tant qu'on ne traite pas ses clubs.
--
-- Stratégie (la moins destructrice possible) :
--   • Club fondé AVEC d'autres membres → on TRANSFÈRE la propriété
--     (à un autre admin de préférence, sinon au plus ancien membre,
--      promu admin). Le club et son contenu sont conservés.
--   • Club fondé SANS autre membre → on SUPPRIME le club (cascade
--     complète : moovies, films, votes, notes, émotions, créneaux…).
--   • Puis on supprime auth.users → cascade sur profiles et toutes
--     les données personnelles de l'utilisateur.
--
-- Le tout est ATOMIQUE (une seule fonction = une transaction) : en cas
-- d'échec, rien n'est laissé à moitié supprimé.
--
-- ⚠️ À EXÉCUTER avec un rôle privilégié :
--    - SQL Editor Supabase (rôle postgres), OU
--    - en RPC avec la clé service_role (cf. scripts/delete-user.mjs).
--    NE JAMAIS exposer ces fonctions au rôle `authenticated`.
-- ============================================================

-- ---------- Aperçu (lecture seule) : que va-t-il se passer ? ----------
create or replace function admin_preview_user_deletion(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  select id into v_uid
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if v_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'user_not_found', 'email', p_email);
  end if;

  return jsonb_build_object(
    'ok', true,
    'user_id', v_uid,
    'email', lower(trim(p_email)),
    'pseudo', (select pseudo from profiles where id = v_uid),
    'memberships', (select count(*) from community_members where user_id = v_uid),
    'votes',       (select count(*) from votes where user_id = v_uid),
    'ratings',     (select count(*) from ratings where user_id = v_uid),
    'journal',     (select count(*) from journal_entries where user_id = v_uid),
    'emotions',    (select count(*) from emotions where user_id = v_uid),
    'slot_votes',  (select count(*) from slot_votes where user_id = v_uid),
    'badges',      (select count(*) from user_badges where user_id = v_uid),
    'communities_founded', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'other_members', (
          select count(*) from community_members cm
          where cm.community_id = c.id and cm.user_id <> v_uid
        ),
        'action', case
          when exists (
            select 1 from community_members cm
            where cm.community_id = c.id and cm.user_id <> v_uid
          ) then 'transfer'
          else 'delete'
        end
      )), '[]'::jsonb)
      from communities c
      where c.created_by = v_uid
    )
  );
end;
$$;

-- ---------- Préparation : traite les clubs fondés, NE touche PAS auth.users ----------
-- Utilisée par le script Node, qui finit via l'Admin API (auth.admin.deleteUser)
-- — utile si le projet interdit le DELETE direct sur auth.users en SQL.
create or replace function admin_prepare_user_deletion(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_comm record;
  v_new_owner uuid;
  v_transferred int := 0;
  v_deleted_comms int := 0;
begin
  select id into v_uid
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if v_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'user_not_found', 'email', p_email);
  end if;

  for v_comm in
    select id from communities where created_by = v_uid
  loop
    select cm.user_id into v_new_owner
    from community_members cm
    where cm.community_id = v_comm.id and cm.user_id <> v_uid
    order by (cm.role = 'admin') desc, cm.joined_at asc
    limit 1;

    if v_new_owner is not null then
      update community_members set role = 'admin'
        where community_id = v_comm.id and user_id = v_new_owner;
      update communities set created_by = v_new_owner where id = v_comm.id;
      v_transferred := v_transferred + 1;
    else
      delete from communities where id = v_comm.id;
      v_deleted_comms := v_deleted_comms + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'ok', true,
    'user_id', v_uid,
    'communities_transferred', v_transferred,
    'communities_deleted', v_deleted_comms
  );
end;
$$;

-- ---------- Suppression définitive (tout-en-un, idéal SQL Editor) ----------
create or replace function admin_delete_user_by_email(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_comm record;
  v_new_owner uuid;
  v_transferred int := 0;
  v_deleted_comms int := 0;
begin
  -- 1) Résoudre l'utilisateur (insensible à la casse et aux espaces).
  select id into v_uid
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if v_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'user_not_found', 'email', p_email);
  end if;

  -- 2) Traiter les clubs FONDÉS par l'utilisateur (FK created_by sans cascade).
  for v_comm in
    select id from communities where created_by = v_uid
  loop
    -- Repreneur : un autre admin en priorité, sinon le plus ancien membre.
    select cm.user_id into v_new_owner
    from community_members cm
    where cm.community_id = v_comm.id
      and cm.user_id <> v_uid
    order by (cm.role = 'admin') desc, cm.joined_at asc
    limit 1;

    if v_new_owner is not null then
      -- Transfert : le repreneur devient admin + propriétaire.
      update community_members
        set role = 'admin'
        where community_id = v_comm.id and user_id = v_new_owner;
      update communities
        set created_by = v_new_owner
        where id = v_comm.id;
      v_transferred := v_transferred + 1;
    else
      -- Aucun autre membre : club orphelin → suppression (cascade complète).
      delete from communities where id = v_comm.id;
      v_deleted_comms := v_deleted_comms + 1;
    end if;
  end loop;

  -- 3) Supprimer l'utilisateur → cascade sur profiles et TOUTES ses données
  --    (community_members, votes, ratings, journal_entries, emotions,
  --     slot_votes, user_badges) + les tables internes auth (sessions…).
  delete from auth.users where id = v_uid;

  return jsonb_build_object(
    'ok', true,
    'user_id', v_uid,
    'email', lower(trim(p_email)),
    'communities_transferred', v_transferred,
    'communities_deleted', v_deleted_comms
  );
end;
$$;

-- ---------- Verrouillage des privilèges (CRITIQUE) ----------
-- Par défaut Postgres accorde EXECUTE à PUBLIC : on le retire,
-- puis on n'autorise QUE le rôle service_role (clé serveur).
revoke all on function admin_preview_user_deletion(text) from public;
revoke all on function admin_prepare_user_deletion(text) from public;
revoke all on function admin_delete_user_by_email(text) from public;
-- (au cas où ces rôles existent)
do $$ begin
  begin revoke all on function admin_preview_user_deletion(text) from authenticated; exception when others then null; end;
  begin revoke all on function admin_prepare_user_deletion(text) from authenticated; exception when others then null; end;
  begin revoke all on function admin_delete_user_by_email(text) from authenticated; exception when others then null; end;
  begin revoke all on function admin_preview_user_deletion(text) from anon; exception when others then null; end;
  begin revoke all on function admin_prepare_user_deletion(text) from anon; exception when others then null; end;
  begin revoke all on function admin_delete_user_by_email(text) from anon; exception when others then null; end;
  begin grant execute on function admin_preview_user_deletion(text) to service_role; exception when others then null; end;
  begin grant execute on function admin_prepare_user_deletion(text) to service_role; exception when others then null; end;
  begin grant execute on function admin_delete_user_by_email(text) to service_role; exception when others then null; end;
end $$;

-- ============================================================
-- USAGE
-- ------------------------------------------------------------
-- Dans le SQL Editor Supabase (rôle postgres) :
--
--   select admin_preview_user_deletion('membre@exemple.com');  -- aperçu
--   select admin_delete_user_by_email('membre@exemple.com');   -- suppression
--
-- Ou via le script Node (clé service_role) :
--
--   node scripts/delete-user.mjs membre@exemple.com          -- aperçu
--   node scripts/delete-user.mjs membre@exemple.com --yes    -- confirme
--
-- Note : si votre projet restreint le DELETE direct sur auth.users
-- depuis SQL, supprimez la ligne `delete from auth.users ...` de la
-- fonction et appelez ensuite l'Admin API (auth.admin.deleteUser) — le
-- script Node ci-dessus gère déjà ce repli automatiquement.
-- ============================================================
