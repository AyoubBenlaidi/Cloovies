-- ============================================================
-- CLOOVIES — Migration 0002 : RPC d'onboarding + durcissement
-- À exécuter si la base a été créée avec une version de 0001_init.sql
-- antérieure à l'ajout des fonctions create_community / join_community.
-- Idempotent : peut être ré-exécuté sans risque.
-- ============================================================

-- Création d'une communauté : l'auteur en devient AUTOMATIQUEMENT admin.
create or replace function create_community(p_name text, p_code text)
returns communities language plpgsql security definer set search_path = public as $$
declare c communities;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into communities (name, invite_code, created_by)
  values (p_name, upper(p_code), auth.uid())
  returning * into c;
  insert into community_members (community_id, user_id, role)
  values (c.id, auth.uid(), 'admin');
  return c;
end;
$$;

-- Rejoindre par code : adhésion en tant que 'member' uniquement.
create or replace function join_community(p_code text)
returns communities language plpgsql security definer set search_path = public as $$
declare c communities;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into c from communities where invite_code = upper(p_code);
  if not found then return null; end if;
  insert into community_members (community_id, user_id, role)
  values (c.id, auth.uid(), 'member')
  on conflict (community_id, user_id) do nothing;
  return c;
end;
$$;

grant execute on function create_community(text, text) to authenticated;
grant execute on function join_community(text) to authenticated;

-- Sécurité : la création/adhésion passe désormais par les RPC ci-dessus.
-- On retire les éventuels inserts directs (anti auto-promotion en admin).
drop policy if exists "communities insert" on communities;
drop policy if exists "members self join" on community_members;
