/* ============================================================
   Couche d'accès aux données — point d'entrée unique de l'app.
   Aucun composant n'importe directement le mock ou Supabase :
   tout passe par "@/lib/data".

   Sélection de la source à l'exécution :
   - Variables NEXT_PUBLIC_SUPABASE_URL + ANON_KEY présentes → Supabase.
   - Sinon → mock (mode démo, données en mémoire) — la démo reste intacte.

   Les deux adaptateurs exposent exactement la même API (mêmes signatures).
   ============================================================ */

import * as mock from "./mock";
import * as supabase from "./supabase";

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// L'adaptateur Supabase implémente la même surface que le mock.
const impl: typeof mock = isSupabaseConfigured
  ? (supabase as unknown as typeof mock)
  : mock;

// --- Session / profil ---
export const getCurrentUserId = impl.getCurrentUserId;
export const getCurrentUser = impl.getCurrentUser;
export const updateProfile = impl.updateProfile;

// --- Communauté ---
export const getActiveCommunity = impl.getActiveCommunity;
export const getMembers = impl.getMembers;
export const getMyRole = impl.getMyRole;
export const joinByCode = impl.joinByCode;
export const createCommunity = impl.createCommunity;

// --- Moovies ---
export const getCurrentMoovie = impl.getCurrentMoovie;
export const getMoovie = impl.getMoovie;
export const getArchivedMoovies = impl.getArchivedMoovies;
export const createMoovie = impl.createMoovie;

// --- Films & votes ---
export const getFilms = impl.getFilms;
export const getFilm = impl.getFilm;
export const getSelectedFilms = impl.getSelectedFilms;
export const addFilm = impl.addFilm;
export const myVoteCount = impl.myVoteCount;
export const toggleVote = impl.toggleVote;

// --- Journal ---
export const getJournal = impl.getJournal;
export const addJournalEntry = impl.addJournalEntry;
export const deleteJournalEntry = impl.deleteJournalEntry;

// --- Émotions ---
export const getMyEmotions = impl.getMyEmotions;
export const countEmotions = impl.countEmotions;
export const setEmotion = impl.setEmotion;
export const getRevealedEmotions = impl.getRevealedEmotions;

// --- Notation ---
export const setRating = impl.setRating;
export const getMyRating = impl.getMyRating;
export const getFilmRating = impl.getFilmRating;

// --- Créneaux de réunion ---
export const getSlots = impl.getSlots;
export const voteSlot = impl.voteSlot;
export const addSlot = impl.addSlot;
export const validateSlot = impl.validateSlot;

// --- Historique / stats ---
export const getClubLibrary = impl.getClubLibrary;
export const getPersonalStats = impl.getPersonalStats;
