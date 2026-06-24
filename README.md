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
lib/data/index.ts     ← point d'entrée unique (sélecteur runtime)
lib/data/mock/        ← adaptateur démo (en mémoire)
lib/data/supabase/    ← adaptateur Supabase (complet)
lib/data/types.ts     ← types métier partagés
```

**La bascule est automatique** : si `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
sont définies, l'app utilise Supabase ; sinon, le mock (mode démo). Aucun changement de code.
L'utilisateur courant vient de la session (`auth.uid`) en mode Supabase, d'un id fixe en mode démo.

---

## Activer Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. **SQL Editor** → exécuter [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   (tables + RLS + trigger de profil + RPC `create_community` / `join_community`).
3. **Storage** → créer deux buckets publics : `avatars` et `posters`.
4. **Authentication → Providers → Email** : pour un flux d'inscription immédiat
   (sans email de confirmation), désactiver *Confirm email*. Sinon l'utilisateur
   devra confirmer son adresse avant de se connecter.
5. Copier `.env.example` → `.env.local` (en local) **et** renseigner ces variables dans Vercel :

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
TMDB_API_KEY=...            # optionnel : import films
```

6. Redémarrer (`npm run dev`) / redéployer. L'app bascule alors sur Supabase.

### Premier lancement (Supabase)
- **S'inscrire** sur `/signup` → un profil est créé automatiquement.
- L'app redirige vers **`/start`** : créer une communauté (vous en devenez **admin**)
  ou en rejoindre une via un code.
- En tant qu'admin : lancer un Moovie, ajouter des films (import TMDB), ouvrir le vote, etc.

> **Note** — La révélation des émotions (mode réunion) n'expose les émotions des
> autres que lorsque le Moovie est en statut `meeting` (règle RLS, cf. US18/19).
> En mode démo, la révélation est toujours visible pour la démonstration.

Clients Supabase : [`lib/supabase/client.ts`](lib/supabase/client.ts) (navigateur),
[`lib/supabase/server.ts`](lib/supabase/server.ts) (serveur), session rafraîchie par [`proxy.ts`](proxy.ts).

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

| US9 Import TMDB | `/films/nouveau` (si `TMDB_API_KEY` défini) |

**Reste en V2** : notifications push, export calendrier (.ics), upload d'affiches vers Storage.

---

## Scripts

```bash
npm run dev     # développement
npm run build   # build de production
npm run start   # serveur de production
```
