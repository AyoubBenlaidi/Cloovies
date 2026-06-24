-- ============================================================
-- CLOOVIES — Schéma initial (Postgres / Supabase)
-- Tables, contraintes et Row Level Security (RLS).
-- ============================================================

-- ---------- Types ----------
create type moovie_status as enum ('draft', 'voting', 'watching', 'meeting', 'archived');
create type emotion_kind  as enum ('joie','nostalgie','malaise','fascination','tristesse','espoir','colere');
create type journal_kind  as enum ('citation','scene','reflexion','question');
create type availability  as enum ('available','maybe','unavailable');
create type member_role   as enum ('admin','member');

-- ---------- Profils (étend auth.users) ----------
create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  pseudo            text not null,
  photo_url         text,
  favorite_film     text,
  favorite_director text,
  favorite_quote    text,
  created_at        timestamptz not null default now()
);

-- ---------- Communautés ----------
create table communities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null unique,
  created_by  uuid not null references profiles(id),
  created_at  timestamptz not null default now()
);

create table community_members (
  community_id uuid not null references communities(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  role         member_role not null default 'member',
  joined_at    timestamptz not null default now(),
  primary key (community_id, user_id)
);

-- ---------- Moovies (cycles) ----------
create table moovies (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references communities(id) on delete cascade,
  number        int not null,
  name          text not null,
  description   text default '',
  theme         text not null,
  start_date    date not null,
  end_date      date not null,
  meeting_date  timestamptz,
  vote_deadline timestamptz not null,
  status        moovie_status not null default 'voting',
  max_votes     int not null default 2,
  created_at    timestamptz not null default now()
);

-- ---------- Films candidats ----------
create table films (
  id           uuid primary key default gen_random_uuid(),
  moovie_id    uuid not null references moovies(id) on delete cascade,
  title        text not null,
  tagline      text,
  description  text default '',
  poster_url   text,
  trailer_url  text,
  is_selected  boolean not null default false,
  -- enrichissement TMDB (V2)
  tmdb_id      int,
  year         int,
  runtime      int,
  director     text,
  genres       text[] default '{}',
  tmdb_rating  numeric(3,1),
  created_at   timestamptz not null default now()
);

-- ---------- Votes (max max_votes / membre / moovie, contrôlé applicativement) ----------
create table votes (
  id        uuid primary key default gen_random_uuid(),
  moovie_id uuid not null references moovies(id) on delete cascade,
  film_id   uuid not null references films(id) on delete cascade,
  user_id   uuid not null references profiles(id) on delete cascade,
  unique (moovie_id, film_id, user_id)
);

-- ---------- Journal de visionnage (privé) ----------
create table journal_entries (
  id         uuid primary key default gen_random_uuid(),
  moovie_id  uuid not null references moovies(id) on delete cascade,
  film_id    uuid not null references films(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  kind       journal_kind not null,
  content    text not null,
  created_at timestamptz not null default now()
);

-- ---------- Émotions (verrouillées jusqu'à la réunion) ----------
create table emotions (
  id            uuid primary key default gen_random_uuid(),
  moovie_id     uuid not null references moovies(id) on delete cascade,
  film_id       uuid not null references films(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  kind          emotion_kind not null,
  justification text default '',
  created_at    timestamptz not null default now(),
  unique (film_id, user_id)
);

-- ---------- Notes /10 ----------
create table ratings (
  id        uuid primary key default gen_random_uuid(),
  moovie_id uuid not null references moovies(id) on delete cascade,
  film_id   uuid not null references films(id) on delete cascade,
  user_id   uuid not null references profiles(id) on delete cascade,
  score     int not null check (score between 1 and 10),
  unique (film_id, user_id)
);

-- ---------- Créneaux de réunion ----------
create table meeting_slots (
  id           uuid primary key default gen_random_uuid(),
  moovie_id    uuid not null references moovies(id) on delete cascade,
  date         date not null,
  start_time   time not null,
  duration_min int not null default 120,
  is_final     boolean not null default false
);

create table slot_votes (
  id           uuid primary key default gen_random_uuid(),
  slot_id      uuid not null references meeting_slots(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  availability availability not null,
  unique (slot_id, user_id)
);

-- ============================================================
-- Helpers
-- ============================================================
create or replace function is_member(c uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from community_members
    where community_id = c and user_id = auth.uid()
  );
$$;

create or replace function is_admin(c uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from community_members
    where community_id = c and user_id = auth.uid() and role = 'admin'
  );
$$;

-- moovie -> community
create or replace function moovie_community(m uuid)
returns uuid language sql security definer stable as $$
  select community_id from moovies where id = m;
$$;

-- Crée automatiquement un profil à l'inscription.
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, pseudo)
  values (new.id, coalesce(new.raw_user_meta_data->>'pseudo', split_part(new.email,'@',1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles          enable row level security;
alter table communities       enable row level security;
alter table community_members enable row level security;
alter table moovies           enable row level security;
alter table films             enable row level security;
alter table votes             enable row level security;
alter table journal_entries   enable row level security;
alter table emotions          enable row level security;
alter table ratings           enable row level security;
alter table meeting_slots     enable row level security;
alter table slot_votes        enable row level security;

-- Profils : lecture par tous les authentifiés, écriture sur soi.
create policy "profiles readable" on profiles for select to authenticated using (true);
create policy "profiles self update" on profiles for update to authenticated using (id = auth.uid());

-- Communautés : visibles par leurs membres ; création libre (l'auteur devient admin via app).
create policy "communities member read" on communities for select to authenticated using (is_member(id));
create policy "communities insert" on communities for insert to authenticated with check (created_by = auth.uid());

create policy "members read" on community_members for select to authenticated using (is_member(community_id));
create policy "members self join" on community_members for insert to authenticated with check (user_id = auth.uid());

-- Moovies : membres lisent ; admins écrivent.
create policy "moovies read" on moovies for select to authenticated using (is_member(community_id));
create policy "moovies admin write" on moovies for all to authenticated
  using (is_admin(community_id)) with check (is_admin(community_id));

-- Films : membres lisent ; admins écrivent.
create policy "films read" on films for select to authenticated using (is_member(moovie_community(moovie_id)));
create policy "films admin write" on films for all to authenticated
  using (is_admin(moovie_community(moovie_id))) with check (is_admin(moovie_community(moovie_id)));

-- Votes : membres lisent (résultats) ; chacun gère ses votes.
create policy "votes read" on votes for select to authenticated using (is_member(moovie_community(moovie_id)));
create policy "votes self write" on votes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and is_member(moovie_community(moovie_id)));

-- Journal : strictement privé.
create policy "journal self" on journal_entries for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Émotions : chacun gère les siennes ; lecture des autres UNIQUEMENT en phase 'meeting' (US18/19).
create policy "emotions self write" on emotions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "emotions reveal at meeting" on emotions for select to authenticated using (
  user_id = auth.uid()
  or exists (select 1 from moovies m where m.id = moovie_id and m.status = 'meeting' and is_member(m.community_id))
);

-- Notes : membres lisent (pour la moyenne) ; chacun gère la sienne.
create policy "ratings read" on ratings for select to authenticated using (is_member(moovie_community(moovie_id)));
create policy "ratings self write" on ratings for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Créneaux : membres lisent ; admins gèrent.
create policy "slots read" on meeting_slots for select to authenticated using (is_member(moovie_community(moovie_id)));
create policy "slots admin write" on meeting_slots for all to authenticated
  using (is_admin(moovie_community(moovie_id))) with check (is_admin(moovie_community(moovie_id)));

-- Votes de créneaux : membres lisent ; chacun gère le sien.
create policy "slot_votes read" on slot_votes for select to authenticated using (
  exists (select 1 from meeting_slots s where s.id = slot_id and is_member(moovie_community(s.moovie_id)))
);
create policy "slot_votes self write" on slot_votes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Index utiles
create index on community_members (user_id);
create index on moovies (community_id, status);
create index on films (moovie_id);
create index on votes (moovie_id);
create index on emotions (moovie_id);
create index on ratings (film_id);
create index on slot_votes (slot_id);
