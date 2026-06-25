-- ============================================================
-- CLOOVIES — Migration 0003 : Système de badges
-- Catalogue tenu côté code (lib/badges/catalog.ts).
-- Cette table stocke uniquement les déblocages par utilisateur.
-- ============================================================

create table if not exists user_badges (
  user_id     uuid not null references profiles(id) on delete cascade,
  badge_key   text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_key)
);

create index if not exists user_badges_user_idx on user_badges (user_id);
create index if not exists user_badges_badge_idx on user_badges (badge_key);

alter table user_badges enable row level security;

-- Lecture : tout membre d'une communauté commune peut voir les badges des autres
-- (utile pour la section "badges les plus rares du club").
create policy "user_badges read by community peers" on user_badges for select to authenticated using (
  user_id = auth.uid()
  or exists (
    select 1
    from community_members me
    join community_members other on other.community_id = me.community_id
    where me.user_id = auth.uid() and other.user_id = user_badges.user_id
  )
);

-- Écriture : chacun gère ses propres déblocages (évalués côté serveur).
create policy "user_badges self write" on user_badges for insert to authenticated
  with check (user_id = auth.uid());
create policy "user_badges self delete" on user_badges for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- Vue d'agrégats : tout ce dont l'évaluateur a besoin en un appel.
-- Renvoyé sous forme JSON pour rester insensible aux évolutions du schéma.
-- ============================================================
create or replace function badge_signals(p_user uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_communities       int;
  v_journal_count     int;
  v_journal_max_words int;
  v_rating_count      int;
  v_rating_distribution jsonb;
  v_ten_count         int;
  v_zero_count        int;
  v_emotion_total     int;
  v_emotion_by_kind   jsonb;
  v_vote_count        int;
  v_winning_votes     int;
  v_solo_votes        int;
  v_films_seen        int;
  v_participations    int;
  v_missed            int;
  v_signup_at         timestamptz;
  v_contrarian        int;
  v_lonely_high       int;
  v_lonely_low        int;
begin
  if p_user is null or p_user <> auth.uid() then
    raise exception 'forbidden';
  end if;

  select count(*) into v_communities
  from community_members where user_id = p_user;

  select count(*),
         coalesce(max(array_length(regexp_split_to_array(trim(content), '\s+'), 1)), 0)
    into v_journal_count, v_journal_max_words
  from journal_entries where user_id = p_user;

  select count(*) into v_rating_count from ratings where user_id = p_user;
  select count(*) into v_ten_count from ratings where user_id = p_user and score = 10;
  select count(*) into v_zero_count from ratings where user_id = p_user and score <= 1; -- score min = 1 en base

  select coalesce(jsonb_object_agg(score::text, c), '{}'::jsonb) into v_rating_distribution
  from (select score, count(*)::int c from ratings where user_id = p_user group by score) s;

  select count(*) into v_emotion_total from emotions where user_id = p_user;
  select coalesce(jsonb_object_agg(kind::text, c), '{}'::jsonb) into v_emotion_by_kind
  from (select kind, count(*)::int c from emotions where user_id = p_user group by kind) e;

  select count(*) into v_vote_count from votes where user_id = p_user;

  -- Votes "gagnants" : films sélectionnés sur le moovie correspondant.
  select count(*) into v_winning_votes
  from votes v
  join films f on f.id = v.film_id
  where v.user_id = p_user and f.is_selected;

  -- Vote solo sur un film (un seul votant tout court — soi-même).
  select count(*) into v_solo_votes
  from (
    select v.film_id
    from votes v
    where v.user_id = p_user
    group by v.film_id
    having count(*) = 1
       and bool_and(v.user_id = p_user)
  ) x;

  -- Films vus = nombre de films notés par l'utilisateur.
  select count(distinct film_id) into v_films_seen from ratings where user_id = p_user;

  -- Participations = moovies distincts où l'utilisateur a une trace (vote/note/émotion/journal).
  select count(distinct moovie_id) into v_participations
  from (
    select moovie_id from votes where user_id = p_user
    union all select moovie_id from ratings where user_id = p_user
    union all select moovie_id from emotions where user_id = p_user
    union all select moovie_id from journal_entries where user_id = p_user
  ) t;

  -- Films "manqués" = films sélectionnés sur un moovie archivé/meeting auquel
  -- l'utilisateur participait mais qu'il n'a pas noté.
  select count(*) into v_missed
  from films f
  join moovies m on m.id = f.moovie_id
  join community_members cm on cm.community_id = m.community_id and cm.user_id = p_user
  where f.is_selected
    and m.status in ('meeting','archived')
    and not exists (select 1 from ratings r where r.film_id = f.id and r.user_id = p_user);

  -- Contrarian : note s'écartant de plus de 3 points de la moyenne du film (≥2 votants).
  with film_avg as (
    select film_id, avg(score)::numeric a, count(*) c
    from ratings group by film_id
  )
  select count(*) into v_contrarian
  from ratings r
  join film_avg fa on fa.film_id = r.film_id
  where r.user_id = p_user and fa.c >= 2 and abs(r.score - fa.a) > 3;

  -- "Le Seul à Avoir Compris" : seul à avoir ≥9 sur un film noté par ≥2 personnes.
  with film_avg as (
    select film_id, count(*) c, sum(case when score >= 9 then 1 else 0 end) high_count
    from ratings group by film_id
  )
  select count(*) into v_lonely_high
  from ratings r
  join film_avg fa on fa.film_id = r.film_id
  where r.user_id = p_user and r.score >= 9 and fa.c >= 2 and fa.high_count = 1;

  -- "Le Seul à Détester" : seul à avoir <3 sur un film noté par ≥2 personnes.
  with film_avg as (
    select film_id, count(*) c, sum(case when score < 3 then 1 else 0 end) low_count
    from ratings group by film_id
  )
  select count(*) into v_lonely_low
  from ratings r
  join film_avg fa on fa.film_id = r.film_id
  where r.user_id = p_user and r.score < 3 and fa.c >= 2 and fa.low_count = 1;

  -- Date d'inscription (profil).
  select created_at into v_signup_at from profiles where id = p_user;

  return jsonb_build_object(
    'communities', v_communities,
    'journalCount', v_journal_count,
    'journalMaxWords', v_journal_max_words,
    'ratingCount', v_rating_count,
    'ratingDistribution', v_rating_distribution,
    'tenCount', v_ten_count,
    'zeroCount', v_zero_count,
    'emotionTotal', v_emotion_total,
    'emotionByKind', v_emotion_by_kind,
    'voteCount', v_vote_count,
    'winningVotes', v_winning_votes,
    'soloVotes', v_solo_votes,
    'filmsSeen', v_films_seen,
    'participations', v_participations,
    'missed', v_missed,
    'contrarian', v_contrarian,
    'lonelyHigh', v_lonely_high,
    'lonelyLow', v_lonely_low,
    'signupAt', v_signup_at
  );
end;
$$;

grant execute on function badge_signals(uuid) to authenticated;

-- ============================================================
-- Statistiques de rareté côté communauté : pour chaque badge_key,
-- combien de membres de la communauté l'ont débloqué.
-- ============================================================
create or replace function community_badge_holders(p_community uuid)
returns table (badge_key text, holders int, total int)
language sql security definer set search_path = public as $$
  with members as (
    select user_id from community_members where community_id = p_community
  )
  select ub.badge_key,
         count(distinct ub.user_id)::int as holders,
         (select count(*)::int from members) as total
  from user_badges ub
  join members m on m.user_id = ub.user_id
  group by ub.badge_key;
$$;

grant execute on function community_badge_holders(uuid) to authenticated;
