# 🎬 Cloovies

> Cloovies n'est pas une application de gestion de films. C'est un **rituel social** : un club privé pour choisir un film, le regarder seul, garder ses émotions secrètes — puis tout révéler le soir de la réunion.

Application **Next.js (App Router)** mobile-first, pensée pour **Vercel**, avec une intégration **Supabase** branchable.

- 📐 Architecture détaillée : [architecture.md](architecture.md)
- ✨ Design system : [design.md](design.md)
- 📋 Fonctionnalités (US) : [fonctionnalites.md](fonctionnalites.md)

---

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000 — l'app tourne en **mode démo** (données en mémoire, aucun backend requis). Un cycle « Moovie #12 · Voyage dans le temps » est pré-rempli avec membres, films, votes, émotions et créneaux.

> Le mode démo permet de naviguer tout le produit (vote, journal, émotions, réunion) sans configurer Supabase.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styles | Tailwind CSS v4 + design tokens (`app/globals.css`) |
| Polices | Playfair Display (titres) · Inter (UI) |
| Données | Couche `lib/data` — mock par défaut, Supabase branchable |
| Déploiement | Vercel |

---

## Architecture des données (le point clé)

Aucun composant n'accède directement à Supabase : **tout passe par `lib/data`**.

```
lib/data/index.ts     ← point d'entrée unique (sélectionne la source)
lib/data/mock/        ← adaptateur démo (en mémoire) — actif par défaut
lib/data/supabase/    ← adaptateur Supabase (modèle à compléter)
lib/data/types.ts     ← types métier partagés
```

Basculer vers Supabase = compléter `lib/data/supabase` puis remplacer, dans `lib/data/index.ts` :

```ts
export * from "./mock";      // →  export * from "./supabase";
```

---

## Activer Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans le **SQL Editor**, exécuter [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) (tables + RLS + trigger de création de profil).
3. Créer deux buckets **Storage** : `avatars` et `posters`.
4. Copier `.env.example` → `.env.local` et renseigner :

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Les clients sont prêts : `lib/supabase/client.ts` (navigateur) et `lib/supabase/server.ts` (serveur).

---

## Déployer sur Vercel

1. Pousser le repo sur GitHub puis l'importer sur Vercel (framework détecté : Next.js).
2. Renseigner les variables d'environnement (mêmes que `.env.example`).
   - **Sans** variables Supabase → la preview tourne en mode démo.
3. Chaque push déclenche un déploiement + preview.

---

## Cartographie fonctionnelle (US → écran)

| US | Écran |
|---|---|
| US1/US2 Compte & connexion | `/signup`, `/login` |
| US3 Profil | `/profil` |
| US4 Rejoindre | `/join` (code démo : `CINE-7421`) |
| US5 Membres | `/profil/membres` |
| US6 Créer un Moovie | `/moovies/nouveau` (admin) |
| US7 Moovies passés | `/profil/historique` |
| US8 Ajouter un film | `/films/nouveau` (admin) |
| US10 Fiche film | `/films/[id]` |
| US11–13 Vote / sélection | `/films` |
| US14–19 Journal & émotions | `/reflexions` |
| US20/21 Notation | `/films/[id]` + mode réunion |
| US22 Mode réunion | `/reunion/live` |
| US24–27 Créneaux de réunion | `/reunion` |

**V2** : import TMDB (US9), notifications, export calendrier.

---

## Scripts

```bash
npm run dev     # développement
npm run build   # build de production
npm run start   # serveur de production
```
