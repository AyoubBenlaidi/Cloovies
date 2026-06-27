/* ============================================================
   Types métier partagés — indépendants de la source (mock | supabase)
   ============================================================ */

export type MoovieStatus =
  | "draft" // en préparation
  | "voting" // vote ouvert
  | "watching" // films sélectionnés, phase de visionnage
  | "meeting" // jour de la réunion (révélation)
  | "archived"; // terminé

export type EmotionKind =
  | "joie"
  | "nostalgie"
  | "malaise"
  | "fascination"
  | "tristesse"
  | "espoir"
  | "colere";

export type JournalKind = "citation" | "scene" | "reflexion" | "question";

export type Availability = "available" | "maybe" | "unavailable";

export type Role = "admin" | "member";

export interface Profile {
  id: string;
  pseudo: string;
  photoUrl: string | null;
  favoriteFilm: string | null;
  favoriteDirector: string | null;
  favoriteQuote: string | null;
}

export interface Community {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
}

export interface Member {
  profile: Profile;
  role: Role;
}

/** Club auquel l'utilisateur appartient, avec son rôle (pour le sélecteur de club). */
export interface CommunitySummary extends Community {
  role: Role;
}

export interface Moovie {
  id: string;
  communityId: string;
  name: string;
  number: number;
  description: string;
  theme: string;
  startDate: string; // ISO
  endDate: string; // ISO
  meetingDate: string | null; // ISO — null tant que non validé
  voteDeadline: string; // ISO
  status: MoovieStatus;
  maxVotes: number;
}

export interface Film {
  id: string;
  moovieId: string;
  title: string;
  posterUrl: string | null;
  trailerUrl: string | null;
  description: string;
  tagline: string | null;
  isSelected: boolean;
  // Champs enrichis (TMDB — V2)
  year: number | null;
  runtime: number | null; // minutes
  director: string | null;
  genres: string[];
  tmdbRating: number | null;
}

export interface Vote {
  id: string;
  moovieId: string;
  filmId: string;
  userId: string;
}

export interface JournalEntry {
  id: string;
  moovieId: string;
  filmId: string;
  userId: string;
  kind: JournalKind;
  content: string;
  createdAt: string;
}

export interface Emotion {
  id: string;
  moovieId: string;
  filmId: string;
  userId: string;
  kind: EmotionKind;
  justification: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  moovieId: string;
  filmId: string;
  userId: string;
  score: number; // 1..10
}

export interface MeetingSlot {
  id: string;
  moovieId: string;
  date: string; // ISO (jour)
  startTime: string; // "20:30"
  durationMin: number;
  isFinal: boolean;
}

export interface SlotVote {
  id: string;
  slotId: string;
  userId: string;
  availability: Availability;
}

/* --- Vues agrégées pratiques pour l'UI --- */

export interface FilmWithVotes extends Film {
  voteCount: number;
  votedByMe: boolean;
}

export interface SlotResult extends MeetingSlot {
  available: number;
  maybe: number;
  unavailable: number;
  total: number;
  myVote: Availability | null;
  score: number; // available + 0.5*maybe
}

export interface EmotionRevealed extends Emotion {
  author: Profile;
}

export const EMOTION_META: Record<
  EmotionKind,
  { label: string; color: string }
> = {
  joie: { label: "Joie", color: "var(--color-emo-joie)" },
  nostalgie: { label: "Nostalgie", color: "var(--color-emo-nostalgie)" },
  malaise: { label: "Malaise", color: "var(--color-emo-malaise)" },
  fascination: { label: "Fascination", color: "var(--color-emo-fascination)" },
  tristesse: { label: "Tristesse", color: "var(--color-emo-tristesse)" },
  espoir: { label: "Espoir", color: "var(--color-emo-espoir)" },
  colere: { label: "Colère", color: "var(--color-emo-colere)" },
};

export const JOURNAL_META: Record<JournalKind, { label: string }> = {
  citation: { label: "Citation" },
  scene: { label: "Scène" },
  reflexion: { label: "Réflexion" },
  question: { label: "Question" },
};
