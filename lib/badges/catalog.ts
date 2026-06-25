/* ============================================================
   Cloovies — Catalogue de badges (succès style "trophées").
   Ton : intelligent, cinéphile, autodérision. Jamais corporate.
   Le déblocage est calculé par lib/badges/evaluator.ts à partir
   des signaux agrégés (cf. supabase RPC badge_signals).
   ============================================================ */

import type { EmotionKind } from "@/lib/data/types";

export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export type BadgeCategory =
  | "demarrage"
  | "participation"
  | "vote"
  | "notes"
  | "emotions"
  | "retards"
  | "reviews"
  | "opinions"
  | "mythiques";

export interface BadgeSignals {
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
  /** Nombre de badges déjà débloqués hors mythiques cumulatifs (calculé en runtime). */
  unlockedCount: number;
}

export interface BadgeDef {
  key: string;
  name: string;
  description: string;
  /** Symbole (emoji ou caractère) — affichage minimaliste. */
  icon: string;
  rarity: Rarity;
  category: BadgeCategory;
  /** Si vrai, la description est masquée tant que non débloqué. */
  hidden?: boolean;
  /** Renvoie true si le badge doit être débloqué. */
  check: (s: BadgeSignals) => boolean;
}

const between = (n: number, low: number, high: number) => n >= low && n <= high;

const ratingsInRange = (s: BadgeSignals, low: number, high: number) =>
  Object.entries(s.ratingDistribution).reduce(
    (acc, [score, count]) => acc + (between(Number(score), low, high) ? count : 0),
    0
  );

export const BADGES: BadgeDef[] = [
  /* ---------- DÉMARRAGE ---------- */
  {
    key: "premier_clap",
    name: "Premier Clap",
    description: "Bienvenue sur Cloovies. Le générique commence.",
    icon: "🎬",
    rarity: "common",
    category: "demarrage",
    check: (s) => !!s.signupAt,
  },
  {
    key: "je_suis_venu_pour_les_films",
    name: "Je suis venu pour les films",
    description: "Rejoindre un cercle de cinéphiles, c'est un acte.",
    icon: "🎟️",
    rarity: "common",
    category: "demarrage",
    check: (s) => s.communities >= 1,
  },
  {
    key: "premiere_impression",
    name: "Première Impression",
    description: "Une note de journal — la première de beaucoup.",
    icon: "🖋️",
    rarity: "common",
    category: "demarrage",
    check: (s) => s.journalCount >= 1,
  },
  {
    key: "critique_en_herbe",
    name: "Critique en Herbe",
    description: "Première note posée. On vous voit.",
    icon: "📓",
    rarity: "common",
    category: "demarrage",
    check: (s) => s.ratingCount >= 1,
  },

  /* ---------- PARTICIPATION ---------- */
  {
    key: "assidu",
    name: "Assidu",
    description: "Trois Moovies au compteur.",
    icon: "📅",
    rarity: "common",
    category: "participation",
    check: (s) => s.participations >= 3,
  },
  {
    key: "fidele_au_poste",
    name: "Fidèle au Poste",
    description: "Dix Moovies. La salle vous connaît.",
    icon: "🪑",
    rarity: "rare",
    category: "participation",
    check: (s) => s.participations >= 10,
  },
  {
    key: "pilier_du_club",
    name: "Pilier du Club",
    description: "Vingt-cinq Moovies. Vous tenez l'édifice.",
    icon: "🏛️",
    rarity: "epic",
    category: "participation",
    check: (s) => s.participations >= 25,
  },
  {
    key: "vieux_de_la_vieille",
    name: "Vieux de la Vieille",
    description: "Cinquante Moovies. Légende vivante.",
    icon: "🎞️",
    rarity: "legendary",
    category: "participation",
    check: (s) => s.participations >= 50,
  },

  /* ---------- LE VOTE ---------- */
  {
    key: "democratie",
    name: "Démocratie Cinématographique",
    description: "Premier bulletin glissé dans l'urne.",
    icon: "🗳️",
    rarity: "common",
    category: "vote",
    check: (s) => s.voteCount >= 1,
  },
  {
    key: "influenceur",
    name: "Influenceur",
    description: "Vous avez voté pour un film qui a gagné. Bien joué.",
    icon: "📣",
    rarity: "rare",
    category: "vote",
    check: (s) => s.winningVotes >= 1,
  },
  {
    key: "faiseur_de_rois",
    name: "Faiseur de Rois",
    description: "Vingt votes gagnants. Vous faites les rois.",
    icon: "👑",
    rarity: "epic",
    category: "vote",
    check: (s) => s.winningVotes >= 20,
  },
  {
    key: "minority_report",
    name: "Minority Report",
    description: "Seul à voter pour un film. L'avenir vous donnera raison.",
    icon: "🫥",
    rarity: "rare",
    category: "vote",
    hidden: true,
    check: (s) => s.soloVotes >= 1,
  },

  /* ---------- LES NOTES ---------- */
  {
    key: "critique_officiel",
    name: "Critique Officiel",
    description: "Vingt notes posées. La main est sûre.",
    icon: "⭐",
    rarity: "rare",
    category: "notes",
    check: (s) => s.ratingCount >= 20,
  },
  {
    key: "le_diplomate",
    name: "Le Diplomate",
    description: "Ne veut fâcher personne. Dix 5/10.",
    icon: "⚖️",
    rarity: "rare",
    category: "notes",
    check: (s) => (s.ratingDistribution["5"] ?? 0) >= 10,
  },
  {
    key: "suisse",
    name: "Suisse",
    description: "Neutralité armée : vingt notes entre 4 et 6.",
    icon: "🏳️",
    rarity: "epic",
    category: "notes",
    check: (s) => ratingsInRange(s, 4, 6) >= 20,
  },
  {
    key: "enthousiaste",
    name: "Enthousiaste",
    description: "Un 10/10 lâché sans regret.",
    icon: "🎆",
    rarity: "common",
    category: "notes",
    check: (s) => s.tenCount >= 1,
  },
  {
    key: "bourreau",
    name: "Bourreau",
    description: "Un 1/10. Pas de pitié.",
    icon: "🪓",
    rarity: "rare",
    category: "notes",
    hidden: true,
    check: (s) => s.zeroCount >= 1,
  },
  {
    key: "impossible_a_satisfaire",
    name: "Impossible à Satisfaire",
    description: "Vingt notes, aucune au-dessus de 6. Cinéma déçoit.",
    icon: "🎭",
    rarity: "epic",
    category: "notes",
    hidden: true,
    check: (s) => s.ratingCount >= 20 && ratingsInRange(s, 7, 10) === 0,
  },
  {
    key: "tout_chef_d_oeuvre",
    name: "Tout est Chef d'Œuvre",
    description: "Vingt notes au-dessus de 8. Tout vous plaît.",
    icon: "🏆",
    rarity: "epic",
    category: "notes",
    check: (s) => ratingsInRange(s, 9, 10) >= 20,
  },

  /* ---------- LES ÉMOTIONS ---------- */
  {
    key: "je_ressens",
    name: "Je Ressens des Choses",
    description: "Première émotion partagée. Le masque tombe.",
    icon: "❤️",
    rarity: "common",
    category: "emotions",
    check: (s) => s.emotionTotal >= 1,
  },
  {
    key: "emotif",
    name: "Émotif",
    description: "Vingt émotions. Le cœur sur la manche.",
    icon: "💧",
    rarity: "rare",
    category: "emotions",
    check: (s) => s.emotionTotal >= 20,
  },
  {
    key: "nostalgique",
    name: "Nostalgique",
    description: "Dix Nostalgie. C'était mieux avant.",
    icon: "📷",
    rarity: "rare",
    category: "emotions",
    check: (s) => (s.emotionByKind.nostalgie ?? 0) >= 10,
  },
  {
    key: "malaise_permanent",
    name: "Malaise Permanent",
    description: "Dix Malaise. Vous aimez ça.",
    icon: "😶‍🌫️",
    rarity: "rare",
    category: "emotions",
    check: (s) => (s.emotionByKind.malaise ?? 0) >= 10,
  },
  {
    key: "coeur_artichaut",
    name: "Cœur d'Artichaut",
    description: "Dix Tristesse. On vous prépare des mouchoirs.",
    icon: "🌹",
    rarity: "rare",
    category: "emotions",
    check: (s) => (s.emotionByKind.tristesse ?? 0) >= 10,
  },
  {
    key: "fascine",
    name: "Fasciné",
    description: "Dix Fascination. Les yeux grands ouverts.",
    icon: "👁️",
    rarity: "rare",
    category: "emotions",
    check: (s) => (s.emotionByKind.fascination ?? 0) >= 10,
  },

  /* ---------- LES RETARDS ---------- */
  {
    key: "pas_eu_le_temps",
    name: "Pas Eu le Temps",
    description: "Un film raté. Ça arrive aux meilleurs.",
    icon: "⏰",
    rarity: "common",
    category: "retards",
    hidden: true,
    check: (s) => s.missed >= 1,
  },
  {
    key: "encore_rate",
    name: "Encore Raté",
    description: "Trois films manqués. On commence à compter.",
    icon: "⌛",
    rarity: "rare",
    category: "retards",
    hidden: true,
    check: (s) => s.missed >= 3,
  },
  {
    key: "fantome_du_club",
    name: "Fantôme du Club",
    description: "Cinq films manqués. On vous croit encore là.",
    icon: "👻",
    rarity: "epic",
    category: "retards",
    hidden: true,
    check: (s) => s.missed >= 5,
  },
  {
    key: "legende_urbaine",
    name: "Légende Urbaine",
    description: "Six mois ici, pas une seule note. Mythe ou rumeur ?",
    icon: "🕵️",
    rarity: "legendary",
    category: "retards",
    hidden: true,
    check: (s) => {
      if (!s.signupAt) return false;
      const sixMonths = 1000 * 60 * 60 * 24 * 30 * 6;
      return Date.now() - new Date(s.signupAt).getTime() >= sixMonths && s.ratingCount === 0;
    },
  },

  /* ---------- LES REVIEWS (journal) ---------- */
  {
    key: "critique_de_cinema",
    name: "Critique de Cinéma",
    description: "Dix notes de journal. La machine est lancée.",
    icon: "⌨️",
    rarity: "rare",
    category: "reviews",
    check: (s) => s.journalCount >= 10,
  },
  {
    key: "critique_professionnel",
    name: "Critique Professionnel",
    description: "Cinquante notes. Vous pouvez ouvrir une revue.",
    icon: "📰",
    rarity: "epic",
    category: "reviews",
    check: (s) => s.journalCount >= 50,
  },
  {
    key: "mur_de_texte",
    name: "Mur de Texte",
    description: "Une réflexion de plus de mille mots. On lit, on lit.",
    icon: "📜",
    rarity: "epic",
    category: "reviews",
    check: (s) => s.journalMaxWords >= 1000,
  },
  {
    key: "tolstoi",
    name: "Tolstoï",
    description: "Plus de trois mille mots. Guerre et Paix du club.",
    icon: "📚",
    rarity: "legendary",
    category: "reviews",
    check: (s) => s.journalMaxWords >= 3000,
  },

  /* ---------- LES OPINIONS ---------- */
  {
    key: "contrarian",
    name: "Contrarian",
    description: "Plus de trois points d'écart avec la moyenne du groupe.",
    icon: "↔️",
    rarity: "rare",
    category: "opinions",
    check: (s) => s.contrarian >= 1,
  },
  {
    key: "ennemi_public",
    name: "Ennemi Public",
    description: "Dix fois à contre-courant. Vous assumez.",
    icon: "🔥",
    rarity: "epic",
    category: "opinions",
    check: (s) => s.contrarian >= 10,
  },
  {
    key: "seul_a_comprendre",
    name: "Le Seul à Avoir Compris",
    description: "Seul à mettre 9 ou 10 à un film. Visionnaire ou seul ?",
    icon: "💡",
    rarity: "legendary",
    category: "opinions",
    check: (s) => s.lonelyHigh >= 1,
  },
  {
    key: "seul_a_detester",
    name: "Le Seul à Détester",
    description: "Seul à descendre un film sous 3. Courage.",
    icon: "🍅",
    rarity: "legendary",
    category: "opinions",
    check: (s) => s.lonelyLow >= 1,
  },

  /* ---------- LES MYTHIQUES ---------- */
  {
    key: "kubrick",
    name: "Kubrick",
    description: "Cinquante films du club au compteur.",
    icon: "🎥",
    rarity: "mythic",
    category: "mythiques",
    check: (s) => s.filmsSeen >= 50,
  },
  {
    key: "scorsese",
    name: "Scorsese",
    description: "Cinquante notes de journal. La plume est nette.",
    icon: "🎙️",
    rarity: "mythic",
    category: "mythiques",
    check: (s) => s.journalCount >= 50,
  },
  {
    key: "tarantino",
    name: "Tarantino",
    description: "Vingt-cinq Moovies débattus. Vous parlez fort.",
    icon: "🎤",
    rarity: "mythic",
    category: "mythiques",
    check: (s) => s.participations >= 25,
  },
  {
    key: "cinephile",
    name: "Cinéphile",
    description: "Trente badges débloqués. Vous savez ce que vous faites.",
    icon: "🌟",
    rarity: "mythic",
    category: "mythiques",
    check: (s) => s.unlockedCount >= 30,
  },
  {
    key: "legende_cloovies",
    name: "Légende du Cloovies Club",
    description: "Tout. Vous avez tout débloqué. Inclinaison.",
    icon: "🏵️",
    rarity: "mythic",
    category: "mythiques",
    check: (s) => s.unlockedCount >= BADGES.length - 1,
  },
];

export const BADGE_BY_KEY: Map<string, BadgeDef> = new Map(
  BADGES.map((b) => [b.key, b])
);

export const RARITY_META: Record<
  Rarity,
  { label: string; color: string; glow: string; order: number }
> = {
  common: { label: "Common", color: "#9a958c", glow: "rgba(154,149,140,0.18)", order: 0 },
  rare: { label: "Rare", color: "#66c6ff", glow: "rgba(102,198,255,0.22)", order: 1 },
  epic: { label: "Epic", color: "#c59eff", glow: "rgba(197,158,255,0.22)", order: 2 },
  legendary: { label: "Legendary", color: "#c89b3c", glow: "rgba(200,155,60,0.32)", order: 3 },
  mythic: { label: "Mythic", color: "#d86b6b", glow: "rgba(216,107,107,0.32)", order: 4 },
};

export const CATEGORY_META: Record<BadgeCategory, { label: string; order: number }> = {
  demarrage: { label: "Démarrage", order: 0 },
  participation: { label: "Participation", order: 1 },
  vote: { label: "Le Vote", order: 2 },
  notes: { label: "Les Notes", order: 3 },
  emotions: { label: "Les Émotions", order: 4 },
  retards: { label: "Les Retards", order: 5 },
  reviews: { label: "Les Reviews", order: 6 },
  opinions: { label: "Les Opinions", order: 7 },
  mythiques: { label: "Les Mythiques", order: 8 },
};
