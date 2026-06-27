import { redirect } from "next/navigation";
import * as seed from "./seed";
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

/* État en mémoire (cloné depuis le seed pour le mode démo).
   Persiste pendant la durée de vie du process Node (dev + instance Vercel chaude).
   En production, c'est une démo : l'état se réinitialise au cold start. */
const db = {
  profiles: structuredClone(seed.profiles),
  communities: structuredClone(seed.communities),
  members: structuredClone(seed.members),
  moovies: structuredClone(seed.moovies),
  films: structuredClone(seed.films),
  votes: structuredClone(seed.votes),
  journal: structuredClone(seed.journalEntries),
  emotions: structuredClone(seed.emotions),
  ratings: structuredClone(seed.ratings),
  slots: structuredClone(seed.meetingSlots),
  slotVotes: structuredClone(seed.slotVotes),
};

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;
const profileOf = (id: string) => db.profiles.find((p) => p.id === id)!;

export const CURRENT_USER_ID = seed.ME;

/* -------- Profil / session -------- */
export async function getCurrentUserId(): Promise<string> {
  return CURRENT_USER_ID;
}

export async function getCurrentUser(): Promise<Profile> {
  return profileOf(CURRENT_USER_ID);
}

export async function updateProfile(
  userId: string,
  patch: Partial<Omit<Profile, "id">>
): Promise<Profile> {
  const p = profileOf(userId);
  Object.assign(p, patch);
  return p;
}

/* -------- Communauté -------- */
/** Clubs dont l'utilisateur courant est membre (avec son rôle). */
export async function getMyCommunities(): Promise<CommunitySummary[]> {
  return db.members
    .filter((m) => m.userId === CURRENT_USER_ID)
    .map((m) => {
      const c = db.communities.find((x) => x.id === m.communityId);
      return c ? { ...c, role: m.role } : null;
    })
    .filter((c): c is CommunitySummary => !!c);
}

export async function getActiveCommunity(): Promise<Community> {
  const mine = await getMyCommunities();
  if (mine.length === 0) redirect("/start");
  const wanted = await readActiveCommunityId();
  // On ne renvoie le club du cookie que si l'utilisateur en est bien membre.
  const active = (wanted && mine.find((c) => c.id === wanted)) || mine[0];
  return { id: active.id, name: active.name, inviteCode: active.inviteCode, createdBy: active.createdBy };
}

export async function getMembers(communityId: string): Promise<Member[]> {
  return db.members
    .filter((m) => m.communityId === communityId)
    .map((m) => ({ profile: profileOf(m.userId), role: m.role }));
}

export async function getMyRole(
  communityId: string,
  userId: string
): Promise<"admin" | "member" | null> {
  return (
    db.members.find((m) => m.communityId === communityId && m.userId === userId)
      ?.role ?? null
  );
}

export async function joinByCode(code: string): Promise<Community | null> {
  const wanted = code.trim().toUpperCase();
  const c = db.communities.find((x) => x.inviteCode === wanted);
  if (!c) return null;
  // Adhésion (membre) si pas déjà membre — un user peut rejoindre plusieurs clubs.
  if (!db.members.some((m) => m.communityId === c.id && m.userId === CURRENT_USER_ID)) {
    db.members.push({ communityId: c.id, userId: CURRENT_USER_ID, role: "member" });
  }
  return c;
}

export async function createCommunity(
  name: string,
  inviteCode: string
): Promise<Community> {
  const community: Community = {
    id: uid("c"),
    name,
    inviteCode: inviteCode.trim().toUpperCase(),
    createdBy: CURRENT_USER_ID,
  };
  db.communities.push(community);
  db.members.push({
    communityId: community.id,
    userId: CURRENT_USER_ID,
    role: "admin",
  });
  return community;
}

/* -------- Moovies -------- */
export async function getCurrentMoovie(
  communityId: string
): Promise<Moovie | null> {
  return (
    db.moovies.find(
      (m) =>
        m.communityId === communityId &&
        m.status !== "archived" &&
        m.status !== "draft"
    ) ?? null
  );
}

export async function getMoovie(id: string): Promise<Moovie | null> {
  return db.moovies.find((m) => m.id === id) ?? null;
}

export async function getArchivedMoovies(
  communityId: string
): Promise<Moovie[]> {
  return db.moovies
    .filter((m) => m.communityId === communityId && m.status === "archived")
    .sort((a, b) => b.number - a.number);
}

export async function createMoovie(
  input: Omit<Moovie, "id" | "number" | "status" | "maxVotes" | "meetingDate">
): Promise<Moovie> {
  const number =
    Math.max(0, ...db.moovies.map((m) => m.number)) + 1;
  const moovie: Moovie = {
    ...input,
    id: uid("m"),
    number,
    status: "voting",
    maxVotes: 2,
    meetingDate: null,
  };
  db.moovies.unshift(moovie);
  return moovie;
}

/* -------- Films & votes -------- */
function withVotes(film: Film, userId: string): FilmWithVotes {
  const filmVotes = db.votes.filter((v) => v.filmId === film.id);
  return {
    ...film,
    voteCount: filmVotes.length,
    votedByMe: filmVotes.some((v) => v.userId === userId),
  };
}

export async function getFilms(
  moovieId: string,
  userId = CURRENT_USER_ID
): Promise<FilmWithVotes[]> {
  return db.films
    .filter((f) => f.moovieId === moovieId)
    .map((f) => withVotes(f, userId))
    .sort((a, b) => b.voteCount - a.voteCount || a.title.localeCompare(b.title));
}

export async function getFilm(
  filmId: string,
  userId = CURRENT_USER_ID
): Promise<FilmWithVotes | null> {
  const f = db.films.find((x) => x.id === filmId);
  return f ? withVotes(f, userId) : null;
}

export async function getSelectedFilms(
  moovieId: string,
  userId = CURRENT_USER_ID
): Promise<FilmWithVotes[]> {
  // Top 2 par votes — base des phases visionnage / réunion.
  return (await getFilms(moovieId, userId)).slice(0, 2);
}

export async function addFilm(
  input: Omit<Film, "id" | "isSelected">
): Promise<Film> {
  const film: Film = { ...input, id: uid("f"), isSelected: false };
  db.films.push(film);
  return film;
}

export async function myVoteCount(
  moovieId: string,
  userId: string
): Promise<number> {
  return db.votes.filter((v) => v.moovieId === moovieId && v.userId === userId)
    .length;
}

/** Bascule un vote. Renvoie l'état { voted } ou une erreur si limite atteinte. */
export async function toggleVote(
  moovieId: string,
  filmId: string,
  userId: string,
  maxVotes = 2
): Promise<{ ok: boolean; voted: boolean; reason?: string }> {
  const existing = db.votes.find(
    (v) => v.moovieId === moovieId && v.filmId === filmId && v.userId === userId
  );
  if (existing) {
    db.votes = db.votes.filter((v) => v.id !== existing.id);
    return { ok: true, voted: false };
  }
  const count = await myVoteCount(moovieId, userId);
  if (count >= maxVotes) {
    return { ok: false, voted: false, reason: `Maximum ${maxVotes} votes.` };
  }
  db.votes.push({ id: uid("v"), moovieId, filmId, userId });
  return { ok: true, voted: true };
}

/* -------- Journal -------- */
export async function getJournal(
  moovieId: string,
  userId: string
): Promise<JournalEntry[]> {
  return db.journal
    .filter((j) => j.moovieId === moovieId && j.userId === userId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function addJournalEntry(input: {
  moovieId: string;
  filmId: string;
  userId: string;
  kind: JournalKind;
  content: string;
}): Promise<JournalEntry> {
  const entry: JournalEntry = {
    ...input,
    id: uid("j"),
    createdAt: new Date().toISOString(),
  };
  db.journal.unshift(entry);
  return entry;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  db.journal = db.journal.filter((j) => j.id !== id);
}

/* -------- Émotions (verrouillées) -------- */
export async function getMyEmotions(
  moovieId: string,
  userId: string
): Promise<Emotion[]> {
  return db.emotions.filter(
    (e) => e.moovieId === moovieId && e.userId === userId
  );
}

export async function countEmotions(moovieId: string): Promise<number> {
  // Nombre de membres ayant partagé au moins une émotion.
  const users = new Set(
    db.emotions.filter((e) => e.moovieId === moovieId).map((e) => e.userId)
  );
  return users.size;
}

export async function setEmotion(input: {
  moovieId: string;
  filmId: string;
  userId: string;
  kind: EmotionKind;
  justification: string;
}): Promise<Emotion> {
  // Une émotion par (film, utilisateur) : on remplace si déjà présente.
  db.emotions = db.emotions.filter(
    (e) =>
      !(
        e.moovieId === input.moovieId &&
        e.filmId === input.filmId &&
        e.userId === input.userId
      )
  );
  const emotion: Emotion = {
    ...input,
    id: uid("e"),
    createdAt: new Date().toISOString(),
  };
  db.emotions.push(emotion);
  return emotion;
}

/** Révélation collective (le jour de la réunion). */
export async function getRevealedEmotions(
  moovieId: string
): Promise<EmotionRevealed[]> {
  return db.emotions
    .filter((e) => e.moovieId === moovieId)
    .map((e) => ({ ...e, author: profileOf(e.userId) }))
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
}

/* -------- Notation -------- */
export async function setRating(input: {
  moovieId: string;
  filmId: string;
  userId: string;
  score: number;
}): Promise<Rating> {
  db.ratings = db.ratings.filter(
    (r) =>
      !(
        r.moovieId === input.moovieId &&
        r.filmId === input.filmId &&
        r.userId === input.userId
      )
  );
  const rating: Rating = { ...input, id: uid("r") };
  db.ratings.push(rating);
  return rating;
}

export async function getMyRating(
  filmId: string,
  userId: string
): Promise<number | null> {
  return db.ratings.find((r) => r.filmId === filmId && r.userId === userId)?.score ?? null;
}

export async function getFilmRating(
  filmId: string
): Promise<{ average: number | null; count: number }> {
  const rs = db.ratings.filter((r) => r.filmId === filmId);
  if (rs.length === 0) return { average: null, count: 0 };
  const avg = rs.reduce((s, r) => s + r.score, 0) / rs.length;
  return { average: Math.round(avg * 10) / 10, count: rs.length };
}

/* -------- Créneaux de réunion -------- */
export async function getSlots(
  moovieId: string,
  userId: string,
  communityId: string
): Promise<SlotResult[]> {
  const total = db.members.filter((m) => m.communityId === communityId).length;
  return db.slots
    .filter((s) => s.moovieId === moovieId)
    .map((s) => {
      const sv = db.slotVotes.filter((v) => v.slotId === s.id);
      const available = sv.filter((v) => v.availability === "available").length;
      const maybe = sv.filter((v) => v.availability === "maybe").length;
      const unavailable = sv.filter((v) => v.availability === "unavailable").length;
      return {
        ...s,
        available,
        maybe,
        unavailable,
        total,
        myVote: sv.find((v) => v.userId === userId)?.availability ?? null,
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
  const existing = db.slotVotes.find(
    (v) => v.slotId === slotId && v.userId === userId
  );
  if (existing) existing.availability = availability;
  else db.slotVotes.push({ id: uid("sv"), slotId, userId, availability });
}

export async function addSlot(input: {
  moovieId: string;
  date: string;
  startTime: string;
  durationMin: number;
}): Promise<MeetingSlot> {
  const slot: MeetingSlot = { ...input, id: uid("s"), isFinal: false };
  db.slots.push(slot);
  return slot;
}

/** Valider le créneau retenu : devient la date officielle du Moovie. */
export async function validateSlot(
  slotId: string,
  moovieId: string
): Promise<void> {
  db.slots.forEach((s) => {
    if (s.moovieId === moovieId) s.isFinal = s.id === slotId;
  });
  const slot = db.slots.find((s) => s.id === slotId);
  const moovie = db.moovies.find((m) => m.id === moovieId);
  if (slot && moovie) {
    const d = new Date(slot.date);
    const [h, mm] = slot.startTime.split(":").map(Number);
    d.setHours(h, mm, 0, 0);
    moovie.meetingDate = d.toISOString();
  }
}

/* -------- Historique / stats -------- */
export async function getClubLibrary(
  communityId: string
): Promise<Array<{ film: Film; moovie: Moovie }>> {
  const moovieIds = db.moovies
    .filter((m) => m.communityId === communityId)
    .map((m) => m.id);
  return db.films
    .filter((f) => f.isSelected && moovieIds.includes(f.moovieId))
    .map((f) => ({
      film: f,
      moovie: db.moovies.find((m) => m.id === f.moovieId)!,
    }))
    .sort((a, b) => b.moovie.number - a.moovie.number);
}

export async function getPersonalStats(userId: string): Promise<{
  filmsSeen: number;
  averageScore: number | null;
  topGenres: Array<{ genre: string; count: number }>;
  topDirectors: Array<{ director: string; count: number }>;
}> {
  const myRatings = db.ratings.filter((r) => r.userId === userId);
  const seenFilmIds = [...new Set(myRatings.map((r) => r.filmId))];
  const seenFilms = seenFilmIds
    .map((id) => db.films.find((f) => f.id === id))
    .filter((f): f is Film => !!f);

  const avg =
    myRatings.length === 0
      ? null
      : Math.round(
          (myRatings.reduce((s, r) => s + r.score, 0) / myRatings.length) * 10
        ) / 10;

  const genreCount = new Map<string, number>();
  const dirCount = new Map<string, number>();
  for (const f of seenFilms) {
    for (const g of f.genres) genreCount.set(g, (genreCount.get(g) ?? 0) + 1);
    if (f.director) dirCount.set(f.director, (dirCount.get(f.director) ?? 0) + 1);
  }
  const top = (m: Map<string, number>, key: "genre" | "director") =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([k, count]) => ({ [key]: k, count })) as never;

  return {
    filmsSeen: seenFilms.length,
    averageScore: avg,
    topGenres: top(genreCount, "genre"),
    topDirectors: top(dirCount, "director"),
  };
}

/* -------- Badges -------- */

// Mémoire en mode démo : badges déjà débloqués (user_id -> Map<key, ISO date>)
const unlockedByUser = new Map<string, Map<string, string>>();
// Date d'inscription simulée (mode démo : "inscrit depuis longtemps")
const SIGNUP_AT = new Date(Date.now() - 1000 * 60 * 60 * 24 * 240).toISOString();

export async function getBadgeSignals(userId: string): Promise<{
  communities: number;
  journalCount: number;
  journalMaxWords: number;
  ratingCount: number;
  ratingDistribution: Record<string, number>;
  tenCount: number;
  zeroCount: number;
  emotionTotal: number;
  emotionByKind: Partial<Record<EmotionKind, number>>;
  voteCount: number;
  winningVotes: number;
  soloVotes: number;
  filmsSeen: number;
  participations: number;
  missed: number;
  contrarian: number;
  lonelyHigh: number;
  lonelyLow: number;
  signupAt: string | null;
}> {
  const communities = db.members.filter((m) => m.userId === userId).length;

  const myJournal = db.journal.filter((j) => j.userId === userId);
  const journalMaxWords = myJournal.reduce(
    (max, j) => Math.max(max, j.content.trim().split(/\s+/).filter(Boolean).length),
    0
  );

  const myRatings = db.ratings.filter((r) => r.userId === userId);
  const ratingDistribution: Record<string, number> = {};
  for (const r of myRatings) {
    ratingDistribution[String(r.score)] = (ratingDistribution[String(r.score)] ?? 0) + 1;
  }

  const myEmotions = db.emotions.filter((e) => e.userId === userId);
  const emotionByKind: Partial<Record<EmotionKind, number>> = {};
  for (const e of myEmotions) {
    emotionByKind[e.kind] = (emotionByKind[e.kind] ?? 0) + 1;
  }

  const myVotes = db.votes.filter((v) => v.userId === userId);
  const winningVotes = myVotes.filter((v) =>
    db.films.find((f) => f.id === v.filmId)?.isSelected
  ).length;

  // soloVotes : films pour lesquels personne d'autre que moi n'a voté
  const voteCountByFilm = new Map<string, Set<string>>();
  for (const v of db.votes) {
    if (!voteCountByFilm.has(v.filmId)) voteCountByFilm.set(v.filmId, new Set());
    voteCountByFilm.get(v.filmId)!.add(v.userId);
  }
  const soloVotes = myVotes.filter((v) => {
    const voters = voteCountByFilm.get(v.filmId)!;
    return voters.size === 1 && voters.has(userId);
  }).length;

  const filmsSeen = new Set(myRatings.map((r) => r.filmId)).size;

  const participations = new Set([
    ...myVotes.map((v) => v.moovieId),
    ...myRatings.map((r) => r.moovieId),
    ...myEmotions.map((e) => e.moovieId),
    ...myJournal.map((j) => j.moovieId),
  ]).size;

  // missed : films sélectionnés, moovie en meeting/archived, dans une communauté
  // dont je suis membre, et non noté par moi.
  const myCommunities = new Set(
    db.members.filter((m) => m.userId === userId).map((m) => m.communityId)
  );
  const missed = db.films.filter((f) => {
    if (!f.isSelected) return false;
    const m = db.moovies.find((x) => x.id === f.moovieId);
    if (!m || !myCommunities.has(m.communityId)) return false;
    if (m.status !== "meeting" && m.status !== "archived") return false;
    return !myRatings.some((r) => r.filmId === f.id);
  }).length;

  // Calculs comparatifs par film (moyennes, isolés).
  const ratingsByFilm = new Map<string, number[]>();
  for (const r of db.ratings) {
    if (!ratingsByFilm.has(r.filmId)) ratingsByFilm.set(r.filmId, []);
    ratingsByFilm.get(r.filmId)!.push(r.score);
  }
  let contrarian = 0;
  let lonelyHigh = 0;
  let lonelyLow = 0;
  for (const r of myRatings) {
    const scores = ratingsByFilm.get(r.filmId) ?? [];
    if (scores.length >= 2) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (Math.abs(r.score - avg) > 3) contrarian += 1;
      if (r.score >= 9 && scores.filter((s) => s >= 9).length === 1) lonelyHigh += 1;
      if (r.score < 3 && scores.filter((s) => s < 3).length === 1) lonelyLow += 1;
    }
  }

  return {
    communities,
    journalCount: myJournal.length,
    journalMaxWords,
    ratingCount: myRatings.length,
    ratingDistribution,
    tenCount: myRatings.filter((r) => r.score === 10).length,
    zeroCount: myRatings.filter((r) => r.score <= 1).length,
    emotionTotal: myEmotions.length,
    emotionByKind,
    voteCount: myVotes.length,
    winningVotes,
    soloVotes,
    filmsSeen,
    participations,
    missed,
    contrarian,
    lonelyHigh,
    lonelyLow,
    signupAt: SIGNUP_AT,
  };
}

export async function getMyBadges(
  userId: string
): Promise<Array<{ key: string; unlockedAt: string }>> {
  const map = unlockedByUser.get(userId);
  if (!map) return [];
  return [...map.entries()].map(([key, unlockedAt]) => ({ key, unlockedAt }));
}

export async function unlockBadges(userId: string, keys: string[]): Promise<void> {
  if (!unlockedByUser.has(userId)) unlockedByUser.set(userId, new Map());
  const map = unlockedByUser.get(userId)!;
  const now = new Date().toISOString();
  for (const k of keys) if (!map.has(k)) map.set(k, now);
}

export async function getCommunityBadgeHolders(
  communityId: string
): Promise<Array<{ badgeKey: string; holders: number; total: number }>> {
  const memberIds = db.members
    .filter((m) => m.communityId === communityId)
    .map((m) => m.userId);
  const total = memberIds.length;
  const counts = new Map<string, Set<string>>();
  for (const uid of memberIds) {
    const map = unlockedByUser.get(uid);
    if (!map) continue;
    for (const key of map.keys()) {
      if (!counts.has(key)) counts.set(key, new Set());
      counts.get(key)!.add(uid);
    }
  }
  return [...counts.entries()].map(([badgeKey, set]) => ({
    badgeKey,
    holders: set.size,
    total,
  }));
}
