/* ============================================================
   Adaptateur Supabase — implémente la même API que lib/data/mock.
   Activé automatiquement quand NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
   sont définies (voir lib/data/index.ts).

   Conventions :
   - Toutes les lectures/écritures respectent la RLS (client "anon" + session).
   - L'utilisateur courant vient de la session (auth.uid), pas d'un id fixe.
   - Mappage systématique snake_case (DB) → camelCase (types métier).
   ============================================================ */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { readActiveCommunityId } from "@/lib/community/cookie";
import type {
  Availability,
  Community,
  CommunitySummary,
  Emotion,
  EmotionKind,
  EmotionRevealed,
  Film,
  FilmWithVotes,
  JournalEntry,
  JournalKind,
  MeetingSlot,
  Member,
  Moovie,
  Profile,
  Rating,
  SlotResult,
} from "@/lib/data/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

/* ---------- Mappage ---------- */
const toProfile = (r: Row): Profile => ({
  id: r.id,
  pseudo: r.pseudo,
  photoUrl: r.photo_url ?? null,
  favoriteFilm: r.favorite_film ?? null,
  favoriteDirector: r.favorite_director ?? null,
  favoriteQuote: r.favorite_quote ?? null,
});

const toCommunity = (r: Row): Community => ({
  id: r.id,
  name: r.name,
  inviteCode: r.invite_code,
  createdBy: r.created_by,
});

const toMoovie = (r: Row): Moovie => ({
  id: r.id,
  communityId: r.community_id,
  number: r.number,
  name: r.name,
  description: r.description ?? "",
  theme: r.theme,
  startDate: r.start_date,
  endDate: r.end_date,
  meetingDate: r.meeting_date ?? null,
  voteDeadline: r.vote_deadline,
  status: r.status,
  maxVotes: r.max_votes,
});

const toFilm = (r: Row): Film => ({
  id: r.id,
  moovieId: r.moovie_id,
  title: r.title,
  tagline: r.tagline ?? null,
  description: r.description ?? "",
  posterUrl: r.poster_url ?? null,
  trailerUrl: r.trailer_url ?? null,
  isSelected: !!r.is_selected,
  year: r.year ?? null,
  runtime: r.runtime ?? null,
  director: r.director ?? null,
  genres: r.genres ?? [],
  tmdbRating: r.tmdb_rating ?? null,
});

const toJournal = (r: Row): JournalEntry => ({
  id: r.id,
  moovieId: r.moovie_id,
  filmId: r.film_id,
  userId: r.user_id,
  kind: r.kind,
  content: r.content,
  createdAt: r.created_at,
});

const toEmotion = (r: Row): Emotion => ({
  id: r.id,
  moovieId: r.moovie_id,
  filmId: r.film_id,
  userId: r.user_id,
  kind: r.kind,
  justification: r.justification ?? "",
  createdAt: r.created_at,
});

const toRating = (r: Row): Rating => ({
  id: r.id,
  moovieId: r.moovie_id,
  filmId: r.film_id,
  userId: r.user_id,
  score: r.score,
});

const toSlot = (r: Row): MeetingSlot => ({
  id: r.id,
  moovieId: r.moovie_id,
  date: r.date,
  startTime: r.start_time,
  durationMin: r.duration_min,
  isFinal: !!r.is_final,
});

/* ---------- Session / profil ---------- */
export async function getCurrentUserId(): Promise<string> {
  const sb = await createClient();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect("/login");
  return data.user.id;
}

export async function getCurrentUser(): Promise<Profile> {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data } = await sb.from("profiles").select("*").eq("id", auth.user.id).single();
  return data ? toProfile(data) : { id: auth.user.id, pseudo: "Membre", photoUrl: null, favoriteFilm: null, favoriteDirector: null, favoriteQuote: null };
}

export async function updateProfile(
  userId: string,
  patch: Partial<Omit<Profile, "id">>
): Promise<Profile> {
  const sb = await createClient();
  const { data } = await sb
    .from("profiles")
    .update({
      pseudo: patch.pseudo,
      photo_url: patch.photoUrl,
      favorite_film: patch.favoriteFilm,
      favorite_director: patch.favoriteDirector,
      favorite_quote: patch.favoriteQuote,
    })
    .eq("id", userId)
    .select("*")
    .single();
  return toProfile(data!);
}

/* ---------- Communauté ---------- */
/** Clubs dont l'utilisateur courant est membre (avec rôle), du plus ancien au plus récent. */
export async function getMyCommunities(): Promise<CommunitySummary[]> {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data } = await sb
    .from("community_members")
    .select("role, joined_at, community:communities(*)")
    .eq("user_id", auth.user.id)
    .order("joined_at", { ascending: true });
  return (data ?? [])
    .filter((r: Row) => r.community)
    .map((r: Row) => ({ ...toCommunity(r.community), role: r.role }));
}

export async function getActiveCommunity(): Promise<Community> {
  const sb = await createClient();
  // 1) Club explicitement sélectionné (cookie) — uniquement si on en est membre.
  //    La RLS sur `communities` (is_member) garantit le cloisonnement.
  const wanted = await readActiveCommunityId();
  if (wanted) {
    const { data } = await sb
      .from("communities")
      .select("*")
      .eq("id", wanted)
      .maybeSingle();
    if (data) return toCommunity(data);
  }
  // 2) Sinon : MA adhésion la plus récente.
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data } = await sb
    .from("community_members")
    .select("joined_at, community:communities(*)")
    .eq("user_id", auth.user.id)
    .order("joined_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data?.community) redirect("/start"); // onboarding : aucun club
  return toCommunity(data.community);
}

export async function getMembers(communityId: string): Promise<Member[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("community_members")
    .select("role, profile:profiles(*)")
    .eq("community_id", communityId);
  return (data ?? []).map((m: Row) => ({
    role: m.role,
    profile: toProfile(m.profile),
  }));
}

export async function getMyRole(
  communityId: string,
  userId: string
): Promise<"admin" | "member" | null> {
  const sb = await createClient();
  const { data } = await sb
    .from("community_members")
    .select("role")
    .match({ community_id: communityId, user_id: userId })
    .maybeSingle();
  return data?.role ?? null;
}

export async function joinByCode(code: string): Promise<Community | null> {
  const sb = await createClient();
  const { data } = await sb.rpc("join_community", { p_code: code });
  return data ? toCommunity(data) : null;
}

export async function createCommunity(
  name: string,
  inviteCode: string
): Promise<Community> {
  const sb = await createClient();
  const { data, error } = await sb.rpc("create_community", {
    p_name: name,
    p_code: inviteCode,
  });
  if (error || !data) throw new Error(error?.message ?? "create_community a échoué");
  return toCommunity(data);
}

/* ---------- Moovies ---------- */
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

export async function getMoovie(id: string): Promise<Moovie | null> {
  const sb = await createClient();
  const { data } = await sb.from("moovies").select("*").eq("id", id).maybeSingle();
  return data ? toMoovie(data) : null;
}

export async function getArchivedMoovies(communityId: string): Promise<Moovie[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("moovies")
    .select("*")
    .eq("community_id", communityId)
    .eq("status", "archived")
    .order("number", { ascending: false });
  return (data ?? []).map(toMoovie);
}

export async function createMoovie(
  input: Omit<Moovie, "id" | "number" | "status" | "maxVotes" | "meetingDate">
): Promise<Moovie> {
  const sb = await createClient();
  const { data: last } = await sb
    .from("moovies")
    .select("number")
    .eq("community_id", input.communityId)
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const number = (last?.number ?? 0) + 1;
  const { data, error } = await sb
    .from("moovies")
    .insert({
      community_id: input.communityId,
      number,
      name: input.name,
      description: input.description,
      theme: input.theme,
      start_date: input.startDate,
      end_date: input.endDate,
      vote_deadline: input.voteDeadline,
      status: "voting",
      max_votes: 2,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "createMoovie a échoué");
  return toMoovie(data);
}

/* ---------- Films & votes ---------- */
async function filmsWithVotes(
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
    .sort((a, b) => b.voteCount - a.voteCount || a.title.localeCompare(b.title));
}

export async function getFilms(
  moovieId: string,
  userId: string
): Promise<FilmWithVotes[]> {
  return filmsWithVotes(moovieId, userId);
}

export async function getFilm(
  filmId: string,
  userId: string
): Promise<FilmWithVotes | null> {
  const sb = await createClient();
  const { data: f } = await sb.from("films").select("*").eq("id", filmId).maybeSingle();
  if (!f) return null;
  const { data: votes } = await sb.from("votes").select("user_id").eq("film_id", filmId);
  return {
    ...toFilm(f),
    voteCount: (votes ?? []).length,
    votedByMe: (votes ?? []).some((v: Row) => v.user_id === userId),
  };
}

export async function getSelectedFilms(
  moovieId: string,
  userId: string
): Promise<FilmWithVotes[]> {
  return (await filmsWithVotes(moovieId, userId)).slice(0, 2);
}

export async function addFilm(
  input: Omit<Film, "id" | "isSelected">
): Promise<Film> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("films")
    .insert({
      moovie_id: input.moovieId,
      title: input.title,
      tagline: input.tagline,
      description: input.description,
      poster_url: input.posterUrl,
      trailer_url: input.trailerUrl,
      year: input.year,
      runtime: input.runtime,
      director: input.director,
      genres: input.genres,
      tmdb_rating: input.tmdbRating,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "addFilm a échoué");
  return toFilm(data);
}

export async function myVoteCount(moovieId: string, userId: string): Promise<number> {
  const sb = await createClient();
  const { count } = await sb
    .from("votes")
    .select("id", { count: "exact", head: true })
    .match({ moovie_id: moovieId, user_id: userId });
  return count ?? 0;
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
  const count = await myVoteCount(moovieId, userId);
  if (count >= maxVotes) return { ok: false, voted: false, reason: `Maximum ${maxVotes} votes.` };
  await sb.from("votes").insert({ moovie_id: moovieId, film_id: filmId, user_id: userId });
  return { ok: true, voted: true };
}

/* ---------- Journal ---------- */
export async function getJournal(moovieId: string, userId: string): Promise<JournalEntry[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("journal_entries")
    .select("*")
    .match({ moovie_id: moovieId, user_id: userId })
    .order("created_at", { ascending: false });
  return (data ?? []).map(toJournal);
}

export async function addJournalEntry(input: {
  moovieId: string;
  filmId: string;
  userId: string;
  kind: JournalKind;
  content: string;
}): Promise<JournalEntry> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("journal_entries")
    .insert({
      moovie_id: input.moovieId,
      film_id: input.filmId,
      user_id: input.userId,
      kind: input.kind,
      content: input.content,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "addJournalEntry a échoué");
  return toJournal(data);
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const sb = await createClient();
  await sb.from("journal_entries").delete().eq("id", id);
}

/* ---------- Émotions ---------- */
export async function getMyEmotions(moovieId: string, userId: string): Promise<Emotion[]> {
  const sb = await createClient();
  const { data } = await sb
    .from("emotions")
    .select("*")
    .match({ moovie_id: moovieId, user_id: userId });
  return (data ?? []).map(toEmotion);
}

export async function countEmotions(moovieId: string): Promise<number> {
  const sb = await createClient();
  // RLS : ne renvoie que ses propres émotions hors phase 'meeting'.
  const { data } = await sb.from("emotions").select("user_id").eq("moovie_id", moovieId);
  return new Set((data ?? []).map((e: Row) => e.user_id)).size;
}

export async function setEmotion(input: {
  moovieId: string;
  filmId: string;
  userId: string;
  kind: EmotionKind;
  justification: string;
}): Promise<Emotion> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("emotions")
    .upsert(
      {
        moovie_id: input.moovieId,
        film_id: input.filmId,
        user_id: input.userId,
        kind: input.kind,
        justification: input.justification,
      },
      { onConflict: "film_id,user_id" }
    )
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "setEmotion a échoué");
  return toEmotion(data);
}

export async function getRevealedEmotions(moovieId: string): Promise<EmotionRevealed[]> {
  const sb = await createClient();
  // RLS "emotions reveal at meeting" : les autres ne sont visibles que si status='meeting'.
  const { data } = await sb
    .from("emotions")
    .select("*, author:profiles(*)")
    .eq("moovie_id", moovieId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((e: Row) => ({ ...toEmotion(e), author: toProfile(e.author) }));
}

/* ---------- Notation ---------- */
export async function setRating(input: {
  moovieId: string;
  filmId: string;
  userId: string;
  score: number;
}): Promise<Rating> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("ratings")
    .upsert(
      {
        moovie_id: input.moovieId,
        film_id: input.filmId,
        user_id: input.userId,
        score: input.score,
      },
      { onConflict: "film_id,user_id" }
    )
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "setRating a échoué");
  return toRating(data);
}

export async function getMyRating(filmId: string, userId: string): Promise<number | null> {
  const sb = await createClient();
  const { data } = await sb
    .from("ratings")
    .select("score")
    .match({ film_id: filmId, user_id: userId })
    .maybeSingle();
  return data?.score ?? null;
}

export async function getFilmRating(
  filmId: string
): Promise<{ average: number | null; count: number }> {
  const sb = await createClient();
  const { data } = await sb.from("ratings").select("score").eq("film_id", filmId);
  const rs = data ?? [];
  if (rs.length === 0) return { average: null, count: 0 };
  const avg = rs.reduce((s: number, r: Row) => s + r.score, 0) / rs.length;
  return { average: Math.round(avg * 10) / 10, count: rs.length };
}

/* ---------- Créneaux de réunion ---------- */
export async function getSlots(
  moovieId: string,
  userId: string,
  communityId: string
): Promise<SlotResult[]> {
  const sb = await createClient();
  const [{ data: slots }, { count: total }] = await Promise.all([
    sb.from("meeting_slots").select("*").eq("moovie_id", moovieId),
    sb
      .from("community_members")
      .select("user_id", { count: "exact", head: true })
      .eq("community_id", communityId),
  ]);
  const slotIds = (slots ?? []).map((s: Row) => s.id);
  const { data: sv } = slotIds.length
    ? await sb.from("slot_votes").select("*").in("slot_id", slotIds)
    : { data: [] as Row[] };

  return (slots ?? [])
    .map((s: Row) => {
      const votes = (sv ?? []).filter((v: Row) => v.slot_id === s.id);
      const available = votes.filter((v: Row) => v.availability === "available").length;
      const maybe = votes.filter((v: Row) => v.availability === "maybe").length;
      const unavailable = votes.filter((v: Row) => v.availability === "unavailable").length;
      return {
        ...toSlot(s),
        available,
        maybe,
        unavailable,
        total: total ?? 0,
        myVote: votes.find((v: Row) => v.user_id === userId)?.availability ?? null,
        score: available + 0.5 * maybe,
      };
    })
    .sort((a, b) => b.score - a.score || +new Date(a.date) - +new Date(b.date));
}

export async function voteSlot(
  slotId: string,
  userId: string,
  availability: Availability
): Promise<void> {
  const sb = await createClient();
  await sb
    .from("slot_votes")
    .upsert({ slot_id: slotId, user_id: userId, availability }, { onConflict: "slot_id,user_id" });
}

export async function addSlot(input: {
  moovieId: string;
  date: string;
  startTime: string;
  durationMin: number;
}): Promise<MeetingSlot> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("meeting_slots")
    .insert({
      moovie_id: input.moovieId,
      date: input.date,
      start_time: input.startTime,
      duration_min: input.durationMin,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "addSlot a échoué");
  return toSlot(data);
}

export async function validateSlot(slotId: string, moovieId: string): Promise<void> {
  const sb = await createClient();
  // Un seul créneau final par moovie.
  await sb.from("meeting_slots").update({ is_final: false }).eq("moovie_id", moovieId);
  await sb.from("meeting_slots").update({ is_final: true }).eq("id", slotId);
  const { data: slot } = await sb
    .from("meeting_slots")
    .select("date, start_time")
    .eq("id", slotId)
    .single();
  if (slot) {
    const d = new Date(`${slot.date}T${slot.start_time}`);
    await sb.from("moovies").update({ meeting_date: d.toISOString() }).eq("id", moovieId);
  }
}

/* ---------- Historique / stats ---------- */
export async function getClubLibrary(
  communityId: string
): Promise<Array<{ film: Film; moovie: Moovie }>> {
  const sb = await createClient();
  const { data } = await sb
    .from("films")
    .select("*, moovie:moovies!inner(*)")
    .eq("is_selected", true)
    .eq("moovie.community_id", communityId);
  return (data ?? [])
    .map((r: Row) => ({ film: toFilm(r), moovie: toMoovie(r.moovie) }))
    .sort((a, b) => b.moovie.number - a.moovie.number);
}

export async function getPersonalStats(userId: string): Promise<{
  filmsSeen: number;
  averageScore: number | null;
  topGenres: Array<{ genre: string; count: number }>;
  topDirectors: Array<{ director: string; count: number }>;
}> {
  const sb = await createClient();
  const { data } = await sb
    .from("ratings")
    .select("score, film:films(*)")
    .eq("user_id", userId);
  const rows = data ?? [];

  const avg =
    rows.length === 0
      ? null
      : Math.round((rows.reduce((s: number, r: Row) => s + r.score, 0) / rows.length) * 10) / 10;

  const genreCount = new Map<string, number>();
  const dirCount = new Map<string, number>();
  const seen = new Set<string>();
  for (const r of rows) {
    const f = r.film as Row;
    if (!f) continue;
    seen.add(f.id);
    for (const g of f.genres ?? []) genreCount.set(g, (genreCount.get(g) ?? 0) + 1);
    if (f.director) dirCount.set(f.director, (dirCount.get(f.director) ?? 0) + 1);
  }
  const topG = [...genreCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([genre, count]) => ({ genre, count }));
  const topD = [...dirCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([director, count]) => ({ director, count }));

  return { filmsSeen: seen.size, averageScore: avg, topGenres: topG, topDirectors: topD };
}

/* ---------- Badges ---------- */
export async function getBadgeSignals(userId: string) {
  const sb = await createClient();
  const { data, error } = await sb.rpc("badge_signals", { p_user: userId });
  if (error || !data) {
    // Fail-soft : on renvoie une coquille vide pour ne jamais casser le flux principal.
    return {
      communities: 0,
      journalCount: 0,
      journalMaxWords: 0,
      ratingCount: 0,
      ratingDistribution: {} as Record<string, number>,
      tenCount: 0,
      zeroCount: 0,
      emotionTotal: 0,
      emotionByKind: {} as Partial<Record<EmotionKind, number>>,
      voteCount: 0,
      winningVotes: 0,
      soloVotes: 0,
      filmsSeen: 0,
      participations: 0,
      missed: 0,
      contrarian: 0,
      lonelyHigh: 0,
      lonelyLow: 0,
      signupAt: null as string | null,
    };
  }
  const d = data as Row;
  return {
    communities: d.communities ?? 0,
    journalCount: d.journalCount ?? 0,
    journalMaxWords: d.journalMaxWords ?? 0,
    ratingCount: d.ratingCount ?? 0,
    ratingDistribution: (d.ratingDistribution ?? {}) as Record<string, number>,
    tenCount: d.tenCount ?? 0,
    zeroCount: d.zeroCount ?? 0,
    emotionTotal: d.emotionTotal ?? 0,
    emotionByKind: (d.emotionByKind ?? {}) as Partial<Record<EmotionKind, number>>,
    voteCount: d.voteCount ?? 0,
    winningVotes: d.winningVotes ?? 0,
    soloVotes: d.soloVotes ?? 0,
    filmsSeen: d.filmsSeen ?? 0,
    participations: d.participations ?? 0,
    missed: d.missed ?? 0,
    contrarian: d.contrarian ?? 0,
    lonelyHigh: d.lonelyHigh ?? 0,
    lonelyLow: d.lonelyLow ?? 0,
    signupAt: (d.signupAt ?? null) as string | null,
  };
}

export async function getMyBadges(
  userId: string
): Promise<Array<{ key: string; unlockedAt: string }>> {
  const sb = await createClient();
  const { data } = await sb
    .from("user_badges")
    .select("badge_key, unlocked_at")
    .eq("user_id", userId);
  return (data ?? []).map((r: Row) => ({ key: r.badge_key, unlockedAt: r.unlocked_at }));
}

export async function unlockBadges(userId: string, keys: string[]): Promise<void> {
  if (!keys.length) return;
  const sb = await createClient();
  await sb
    .from("user_badges")
    .upsert(
      keys.map((k) => ({ user_id: userId, badge_key: k })),
      { onConflict: "user_id,badge_key", ignoreDuplicates: true }
    );
}

export async function getCommunityBadgeHolders(
  communityId: string
): Promise<Array<{ badgeKey: string; holders: number; total: number }>> {
  const sb = await createClient();
  const { data } = await sb.rpc("community_badge_holders", { p_community: communityId });
  return (data ?? []).map((r: Row) => ({
    badgeKey: r.badge_key,
    holders: r.holders,
    total: r.total,
  }));
}
