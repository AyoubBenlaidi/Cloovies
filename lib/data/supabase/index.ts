/* ============================================================
   Adaptateur Supabase (MODÈLE).

   Ce fichier montre comment réimplémenter la même API que le mock
   (lib/data/mock) avec Supabase. Quelques méthodes clés sont
   implémentées comme patron ; les autres suivent exactement la même
   forme (requête + mapping snake_case → camelCase).

   ⚠️ Non câblé par défaut : lib/data/index.ts ré-exporte le mock.
   Pour activer Supabase, une fois ce module complété :

     // lib/data/index.ts
     export * from "./supabase";   // au lieu de "./mock"

   Prérequis : variables NEXT_PUBLIC_SUPABASE_URL / ANON_KEY définies
   et migrations appliquées (supabase/migrations/0001_init.sql).
   ============================================================ */

import { createClient } from "@/lib/supabase/server";
import type {
  Community,
  Film,
  FilmWithVotes,
  Member,
  Moovie,
  Profile,
} from "@/lib/data/types";

/* -------- Mapping lignes → types métier -------- */
type Row = Record<string, unknown>;

function toProfile(r: Row): Profile {
  return {
    id: r.id as string,
    pseudo: r.pseudo as string,
    photoUrl: (r.photo_url as string) ?? null,
    favoriteFilm: (r.favorite_film as string) ?? null,
    favoriteDirector: (r.favorite_director as string) ?? null,
    favoriteQuote: (r.favorite_quote as string) ?? null,
  };
}

function toMoovie(r: Row): Moovie {
  return {
    id: r.id as string,
    communityId: r.community_id as string,
    number: r.number as number,
    name: r.name as string,
    description: (r.description as string) ?? "",
    theme: r.theme as string,
    startDate: r.start_date as string,
    endDate: r.end_date as string,
    meetingDate: (r.meeting_date as string) ?? null,
    voteDeadline: r.vote_deadline as string,
    status: r.status as Moovie["status"],
    maxVotes: r.max_votes as number,
  };
}

function toFilm(r: Row): Film {
  return {
    id: r.id as string,
    moovieId: r.moovie_id as string,
    title: r.title as string,
    tagline: (r.tagline as string) ?? null,
    description: (r.description as string) ?? "",
    posterUrl: (r.poster_url as string) ?? null,
    trailerUrl: (r.trailer_url as string) ?? null,
    isSelected: Boolean(r.is_selected),
    year: (r.year as number) ?? null,
    runtime: (r.runtime as number) ?? null,
    director: (r.director as string) ?? null,
    genres: (r.genres as string[]) ?? [],
    tmdbRating: (r.tmdb_rating as number) ?? null,
  };
}

/* -------- Session / profil -------- */
export async function getCurrentUser(): Promise<Profile | null> {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const { data } = await sb.from("profiles").select("*").eq("id", auth.user.id).single();
  return data ? toProfile(data) : null;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Omit<Profile, "id">>
): Promise<void> {
  const sb = await createClient();
  await sb
    .from("profiles")
    .update({
      pseudo: patch.pseudo,
      photo_url: patch.photoUrl,
      favorite_film: patch.favoriteFilm,
      favorite_director: patch.favoriteDirector,
      favorite_quote: patch.favoriteQuote,
    })
    .eq("id", userId);
}

/* -------- Communauté -------- */
export async function getActiveCommunity(): Promise<Community | null> {
  const sb = await createClient();
  // La 1re communauté du membre courant (RLS filtre déjà sur l'appartenance).
  const { data } = await sb.from("communities").select("*").limit(1).single();
  return data
    ? {
        id: data.id,
        name: data.name,
        inviteCode: data.invite_code,
        createdBy: data.created_by,
      }
    : null;
}

export async function getMembers(communityId: string): Promise<Member[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("community_members")
    .select("role, profiles(*)")
    .eq("community_id", communityId);
  return (data ?? []).map((m: Row) => ({
    role: m.role as Member["role"],
    profile: toProfile(m.profiles as Row),
  }));
}

/* -------- Moovies -------- */
export async function getCurrentMoovie(communityId: string): Promise<Moovie | null> {
  const sb = await createClient();
  const { data } = await sb
    .from("moovies")
    .select("*")
    .eq("community_id", communityId)
    .not("status", "in", "(archived,draft)")
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? toMoovie(data) : null;
}

/* -------- Films & votes -------- */
export async function getFilms(
  moovieId: string,
  userId: string
): Promise<FilmWithVotes[]> {
  const sb = await createClient();
  const [{ data: films }, { data: votes }] = await Promise.all([
    sb.from("films").select("*").eq("moovie_id", moovieId),
    sb.from("votes").select("film_id, user_id").eq("moovie_id", moovieId),
  ]);
  return (films ?? [])
    .map((f: Row) => {
      const fv = (votes ?? []).filter((v: Row) => v.film_id === f.id);
      return {
        ...toFilm(f),
        voteCount: fv.length,
        votedByMe: fv.some((v: Row) => v.user_id === userId),
      };
    })
    .sort((a, b) => b.voteCount - a.voteCount);
}

export async function toggleVote(
  moovieId: string,
  filmId: string,
  userId: string,
  maxVotes = 2
): Promise<{ ok: boolean; voted: boolean; reason?: string }> {
  const sb = await createClient();
  const { data: existing } = await sb
    .from("votes")
    .select("id")
    .match({ moovie_id: moovieId, film_id: filmId, user_id: userId })
    .maybeSingle();

  if (existing) {
    await sb.from("votes").delete().eq("id", existing.id);
    return { ok: true, voted: false };
  }
  const { count } = await sb
    .from("votes")
    .select("id", { count: "exact", head: true })
    .match({ moovie_id: moovieId, user_id: userId });
  if ((count ?? 0) >= maxVotes) {
    return { ok: false, voted: false, reason: `Maximum ${maxVotes} votes.` };
  }
  await sb.from("votes").insert({ moovie_id: moovieId, film_id: filmId, user_id: userId });
  return { ok: true, voted: true };
}

/* TODO — implémenter sur le même modèle :
   getMoovie, getArchivedMoovies, createMoovie, getFilm, getSelectedFilms,
   addFilm, myVoteCount, getJournal, addJournalEntry, deleteJournalEntry,
   getMyEmotions, setEmotion, getRevealedEmotions, countEmotions,
   setRating, getMyRating, getFilmRating, getSlots, voteSlot, addSlot,
   validateSlot, getClubLibrary, getPersonalStats, joinByCode, getMyRole. */
