import type {
  Community,
  Emotion,
  Film,
  JournalEntry,
  MeetingSlot,
  Moovie,
  Profile,
  Rating,
  SlotVote,
  Vote,
} from "@/lib/data/types";

/** Utilisateur courant du mode démo. */
export const ME = "u-1";

export const profiles: Profile[] = [
  {
    id: "u-1",
    pseudo: "Ayoub",
    photoUrl: null,
    favoriteFilm: "Mulholland Drive",
    favoriteDirector: "David Lynch",
    favoriteQuote: "Le cinéma, c'est un rêve qu'on fait les yeux ouverts.",
  },
  { id: "u-2", pseudo: "Camille", photoUrl: null, favoriteFilm: "In the Mood for Love", favoriteDirector: "Wong Kar-wai", favoriteQuote: null },
  { id: "u-3", pseudo: "Naël", photoUrl: null, favoriteFilm: "Stalker", favoriteDirector: "Andreï Tarkovski", favoriteQuote: null },
  { id: "u-4", pseudo: "Lucie", photoUrl: null, favoriteFilm: "Lost in Translation", favoriteDirector: "Sofia Coppola", favoriteQuote: null },
  { id: "u-5", pseudo: "Sasha", photoUrl: null, favoriteFilm: "Blade Runner 2049", favoriteDirector: "Denis Villeneuve", favoriteQuote: null },
  { id: "u-6", pseudo: "Théo", photoUrl: null, favoriteFilm: "Le Voyage de Chihiro", favoriteDirector: "Hayao Miyazaki", favoriteQuote: null },
];

// L'utilisateur courant (u-1) appartient à DEUX clubs — pour démontrer
// le multi-club et le cloisonnement de l'affichage.
export const communities: Community[] = [
  { id: "c-1", name: "Le Cercle", inviteCode: "CINE-7421", createdBy: "u-1" },
  {
    id: "c-2",
    name: "Ciné Club du Dimanche",
    inviteCode: "CINE-2090",
    createdBy: "u-2",
  },
];

/** @deprecated conservé pour compat — préférez `communities`. */
export const community: Community = communities[0];

export const members: Array<{ communityId: string; userId: string; role: "admin" | "member" }> = [
  // Club 1 — Le Cercle (u-1 est admin)
  { communityId: "c-1", userId: "u-1", role: "admin" },
  { communityId: "c-1", userId: "u-2", role: "member" },
  { communityId: "c-1", userId: "u-3", role: "member" },
  { communityId: "c-1", userId: "u-4", role: "member" },
  { communityId: "c-1", userId: "u-5", role: "member" },
  { communityId: "c-1", userId: "u-6", role: "member" },
  // Club 2 — Ciné Club du Dimanche (u-1 y est simple membre)
  { communityId: "c-2", userId: "u-2", role: "admin" },
  { communityId: "c-2", userId: "u-1", role: "member" },
  { communityId: "c-2", userId: "u-4", role: "member" },
  { communityId: "c-2", userId: "u-5", role: "member" },
];

// Dates calées autour de "maintenant" pour un rendu vivant.
const now = new Date();
const inDays = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};
const atHour = (iso: string, h: number, m = 0) => {
  const d = new Date(iso);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const moovies: Moovie[] = [
  {
    id: "m-12",
    communityId: "c-1",
    number: 12,
    name: "Voyage dans le temps",
    theme: "Films de voyage dans le temps",
    description:
      "Boucles, paradoxes et secondes chances. Cinq films qui plient le temps — et nous avec.",
    startDate: inDays(-9),
    endDate: inDays(6),
    meetingDate: null,
    voteDeadline: inDays(3),
    status: "voting",
    maxVotes: 2,
  },
  {
    id: "m-11",
    communityId: "c-1",
    number: 11,
    name: "Solitudes urbaines",
    theme: "La ville comme personnage",
    description: "Des néons qui ne consolent personne.",
    startDate: inDays(-45),
    endDate: inDays(-18),
    meetingDate: atHour(inDays(-16), 20, 30),
    voteDeadline: inDays(-40),
    status: "archived",
    maxVotes: 2,
  },
  {
    id: "m-10",
    communityId: "c-1",
    number: 10,
    name: "Premiers longs",
    theme: "Le premier film d'un grand cinéaste",
    description: "Là où tout commence, maladroit et déjà génial.",
    startDate: inDays(-78),
    endDate: inDays(-50),
    meetingDate: atHour(inDays(-48), 20, 30),
    voteDeadline: inDays(-72),
    status: "archived",
    maxVotes: 2,
  },
  // --- Moovie du Club 2 (Ciné Club du Dimanche) ---
  {
    id: "m-22",
    communityId: "c-2",
    number: 5,
    name: "Le monde de Miyazaki",
    theme: "Studio Ghibli",
    description:
      "Forêts qui respirent, machines qui rêvent. Le vote du dimanche pour la prochaine séance Ghibli.",
    startDate: inDays(-5),
    endDate: inDays(10),
    meetingDate: null,
    voteDeadline: inDays(4),
    status: "voting",
    maxVotes: 2,
  },
];

export const films: Film[] = [
  {
    id: "f-1", moovieId: "m-12", title: "Primer", tagline: "Quatre dimensions, aucune issue.",
    description: "Quatre ingénieurs bricolent dans un garage et tombent par accident sur une machine capable de plier le temps. Un huis clos vertigineux sur l'ambition et la confiance.",
    posterUrl: null, trailerUrl: "https://www.youtube.com/watch?v=Y6Qe1lF_Z0Y",
    isSelected: false, year: 2004, runtime: 77, director: "Shane Carruth",
    genres: ["Science-fiction", "Drame"], tmdbRating: 6.9,
  },
  {
    id: "f-2", moovieId: "m-12", title: "La Jetée", tagline: "Un souvenir d'enfance, une guerre, une boucle.",
    description: "Roman-photo de science-fiction : dans un Paris d'après-guerre, un homme est envoyé dans ses propres souvenirs. Le film qui inspira L'Armée des 12 singes.",
    posterUrl: null, trailerUrl: "https://www.youtube.com/watch?v=Q1Jdfb-DHsk",
    isSelected: false, year: 1962, runtime: 28, director: "Chris Marker",
    genres: ["Science-fiction", "Court-métrage"], tmdbRating: 8.1,
  },
  {
    id: "f-3", moovieId: "m-12", title: "Un jour sans fin", tagline: "Et si demain n'arrivait jamais ?",
    description: "Un présentateur météo cynique se retrouve prisonnier d'une même journée qui se répète à l'infini. Comédie devenue méditation sur le sens de l'existence.",
    posterUrl: null, trailerUrl: "https://www.youtube.com/watch?v=tSVeDx9fk60",
    isSelected: false, year: 1993, runtime: 101, director: "Harold Ramis",
    genres: ["Comédie", "Romance", "Fantastique"], tmdbRating: 8.0,
  },
  {
    id: "f-4", moovieId: "m-12", title: "L'Armée des 12 singes", tagline: "Le futur est une mémoire.",
    description: "Un prisonnier est renvoyé dans le passé pour enrayer un virus qui a décimé l'humanité. Un labyrinthe paranoïaque signé Terry Gilliam.",
    posterUrl: null, trailerUrl: "https://www.youtube.com/watch?v=15s4Y9ffW_o",
    isSelected: false, year: 1995, runtime: 129, director: "Terry Gilliam",
    genres: ["Science-fiction", "Thriller"], tmdbRating: 7.6,
  },
  {
    id: "f-5", moovieId: "m-12", title: "Predestination", tagline: "Le serpent qui se mord la queue.",
    description: "Un agent temporel traque un criminel à travers les époques, dans une intrigue qui se referme sur elle-même de façon stupéfiante.",
    posterUrl: null, trailerUrl: "https://www.youtube.com/watch?v=Ec5Bl1ANvMU",
    isSelected: false, year: 2014, runtime: 97, director: "Spierig Brothers",
    genres: ["Science-fiction", "Thriller"], tmdbRating: 7.4,
  },
  // --- Films des Moovies archivés (pour la bibliothèque) ---
  {
    id: "f-21", moovieId: "m-11", title: "Taxi Driver", tagline: "", description: "La descente d'un chauffeur de taxi dans la nuit new-yorkaise.",
    posterUrl: null, trailerUrl: null, isSelected: true, year: 1976, runtime: 114, director: "Martin Scorsese", genres: ["Drame", "Crime"], tmdbRating: 8.2,
  },
  {
    id: "f-22", moovieId: "m-11", title: "Lost in Translation", tagline: "", description: "Deux solitudes se croisent à Tokyo.",
    posterUrl: null, trailerUrl: null, isSelected: true, year: 2003, runtime: 102, director: "Sofia Coppola", genres: ["Drame", "Romance"], tmdbRating: 7.7,
  },
  {
    id: "f-31", moovieId: "m-10", title: "Reservoir Dogs", tagline: "", description: "Un casse qui tourne mal, en huis clos.",
    posterUrl: null, trailerUrl: null, isSelected: true, year: 1992, runtime: 99, director: "Quentin Tarantino", genres: ["Crime", "Thriller"], tmdbRating: 8.1,
  },
  {
    id: "f-32", moovieId: "m-10", title: "Pi", tagline: "", description: "Un mathématicien au bord de la folie cherche le code du monde.",
    posterUrl: null, trailerUrl: null, isSelected: true, year: 1998, runtime: 84, director: "Darren Aronofsky", genres: ["Thriller", "Science-fiction"], tmdbRating: 7.0,
  },
  // --- Films candidats du Club 2 (moovie m-22) ---
  {
    id: "g-1", moovieId: "m-22", title: "Le Voyage de Chihiro", tagline: "De l'autre côté du tunnel, un autre monde.",
    description: "Une fillette s'égare dans un monde d'esprits où ses parents sont changés en cochons. Elle devra travailler aux bains pour les sauver.",
    posterUrl: null, trailerUrl: "https://www.youtube.com/watch?v=ByXuk9QqQkk",
    isSelected: false, year: 2001, runtime: 125, director: "Hayao Miyazaki", genres: ["Animation", "Fantastique"], tmdbRating: 8.5,
  },
  {
    id: "g-2", moovieId: "m-22", title: "Princesse Mononoké", tagline: "La forêt contre les hommes.",
    description: "Un jeune prince maudit se retrouve au cœur d'une guerre entre les dieux de la forêt et les humains qui l'exploitent.",
    posterUrl: null, trailerUrl: "https://www.youtube.com/watch?v=4OiMOHRDs14",
    isSelected: false, year: 1997, runtime: 134, director: "Hayao Miyazaki", genres: ["Animation", "Aventure"], tmdbRating: 8.3,
  },
  {
    id: "g-3", moovieId: "m-22", title: "Mon voisin Totoro", tagline: "Le gardien de la forêt veille.",
    description: "Deux sœurs emménagent à la campagne et se lient d'amitié avec les esprits bienveillants de la forêt voisine.",
    posterUrl: null, trailerUrl: "https://www.youtube.com/watch?v=92a7Hj0ijLs",
    isSelected: false, year: 1988, runtime: 86, director: "Hayao Miyazaki", genres: ["Animation", "Famille"], tmdbRating: 8.1,
  },
];

// Votes du Moovie en cours (f-2 et f-3 en tête).
export const votes: Vote[] = [
  { id: "v-1", moovieId: "m-12", filmId: "f-2", userId: "u-1" },
  { id: "v-2", moovieId: "m-12", filmId: "f-3", userId: "u-1" },
  { id: "v-3", moovieId: "m-12", filmId: "f-2", userId: "u-2" },
  { id: "v-4", moovieId: "m-12", filmId: "f-4", userId: "u-2" },
  { id: "v-5", moovieId: "m-12", filmId: "f-3", userId: "u-3" },
  { id: "v-6", moovieId: "m-12", filmId: "f-2", userId: "u-3" },
  { id: "v-7", moovieId: "m-12", filmId: "f-5", userId: "u-4" },
  { id: "v-8", moovieId: "m-12", filmId: "f-3", userId: "u-4" },
  { id: "v-9", moovieId: "m-12", filmId: "f-2", userId: "u-5" },
  { id: "v-10", moovieId: "m-12", filmId: "f-1", userId: "u-5" },
  { id: "v-11", moovieId: "m-12", filmId: "f-3", userId: "u-6" },
  // Votes du Club 2 (moovie m-22) — g-1 en tête
  { id: "v-21", moovieId: "m-22", filmId: "g-1", userId: "u-1" },
  { id: "v-22", moovieId: "m-22", filmId: "g-2", userId: "u-2" },
  { id: "v-23", moovieId: "m-22", filmId: "g-1", userId: "u-2" },
  { id: "v-24", moovieId: "m-22", filmId: "g-1", userId: "u-4" },
  { id: "v-25", moovieId: "m-22", filmId: "g-3", userId: "u-5" },
];

export const journalEntries: JournalEntry[] = [
  { id: "j-1", moovieId: "m-12", filmId: "f-2", userId: "u-1", kind: "scene", content: "Le visage sur la jetée, à la fin. On comprend trop tard ce qu'on regardait depuis le début.", createdAt: inDays(-2) },
  { id: "j-2", moovieId: "m-12", filmId: "f-3", userId: "u-1", kind: "question", content: "Combien de jours faut-il répéter avant de devenir quelqu'un de bien ?", createdAt: inDays(-1) },
];

// Émotions verrouillées (révélées seulement en mode réunion).
export const emotions: Emotion[] = [
  { id: "e-1", moovieId: "m-12", filmId: "f-2", userId: "u-1", kind: "nostalgie", justification: "Cette idée que notre fin est inscrite dans notre premier souvenir m'a serré la gorge.", createdAt: inDays(-2) },
  { id: "e-2", moovieId: "m-12", filmId: "f-2", userId: "u-2", kind: "tristesse", justification: "Un amour qui n'a jamais eu lieu et qui pourtant nous traverse.", createdAt: inDays(-2) },
  { id: "e-3", moovieId: "m-12", filmId: "f-2", userId: "u-3", kind: "fascination", justification: "28 minutes d'images fixes et plus de cinéma que dans la plupart des blockbusters.", createdAt: inDays(-1) },
  { id: "e-4", moovieId: "m-12", filmId: "f-3", userId: "u-4", kind: "espoir", justification: "On peut recommencer. Encore. Jusqu'à mériter sa propre journée.", createdAt: inDays(-1) },
  { id: "e-5", moovieId: "m-12", filmId: "f-3", userId: "u-5", kind: "joie", justification: "La scène du piano. Le bonheur de devenir bon à force d'essayer.", createdAt: inDays(-1) },
];

export const ratings: Rating[] = [
  { id: "r-1", moovieId: "m-12", filmId: "f-2", userId: "u-1", score: 9 },
  { id: "r-2", moovieId: "m-12", filmId: "f-2", userId: "u-2", score: 8 },
  { id: "r-3", moovieId: "m-12", filmId: "f-2", userId: "u-3", score: 10 },
  { id: "r-4", moovieId: "m-12", filmId: "f-3", userId: "u-4", score: 7 },
  { id: "r-5", moovieId: "m-12", filmId: "f-3", userId: "u-5", score: 8 },
  // notation des films archivés (pour stats perso)
  { id: "r-21", moovieId: "m-11", filmId: "f-21", userId: "u-1", score: 9 },
  { id: "r-22", moovieId: "m-11", filmId: "f-22", userId: "u-1", score: 8 },
  { id: "r-31", moovieId: "m-10", filmId: "f-31", userId: "u-1", score: 7 },
  { id: "r-32", moovieId: "m-10", filmId: "f-32", userId: "u-1", score: 8 },
];

export const meetingSlots: MeetingSlot[] = [
  { id: "s-1", moovieId: "m-12", date: inDays(7), startTime: "20:30", durationMin: 150, isFinal: false },
  { id: "s-2", moovieId: "m-12", date: inDays(8), startTime: "20:00", durationMin: 150, isFinal: false },
  { id: "s-3", moovieId: "m-12", date: inDays(9), startTime: "19:30", durationMin: 150, isFinal: false },
];

export const slotVotes: SlotVote[] = [
  { id: "sv-1", slotId: "s-1", userId: "u-1", availability: "available" },
  { id: "sv-2", slotId: "s-1", userId: "u-2", availability: "available" },
  { id: "sv-3", slotId: "s-1", userId: "u-3", availability: "maybe" },
  { id: "sv-4", slotId: "s-1", userId: "u-4", availability: "available" },
  { id: "sv-5", slotId: "s-2", userId: "u-1", availability: "maybe" },
  { id: "sv-6", slotId: "s-2", userId: "u-2", availability: "unavailable" },
  { id: "sv-7", slotId: "s-2", userId: "u-5", availability: "available" },
  { id: "sv-8", slotId: "s-3", userId: "u-3", availability: "available" },
  { id: "sv-9", slotId: "s-3", userId: "u-6", availability: "available" },
];
