# CLOOVIES — Architecture Technique

> Objectif : une architecture **simple, pratique et déployable sur Vercel**, avec une intégration **Supabase** branchable sans réécriture. Mobile-first, premium, sobre.

---

## 1. Vue d'ensemble

Cloovies est une application web **mobile-first** (largeur max 480px) qui vit comme un « club privé » de cinéma. Un seul codebase Next.js gère à la fois l'interface et la logique serveur, ce qui colle parfaitement au déploiement Vercel.

```
┌─────────────────────────────────────────────┐
│              Navigateur (mobile)             │
│   Next.js App Router · React · Tailwind      │
└───────────────┬──────────────────────────────┘
                │  Server Components / Server Actions
┌───────────────▼──────────────────────────────┐
│        Next.js (déployé sur Vercel)          │
│  - Rendu serveur + routes                    │
│  - Couche d'accès données (lib/data)         │
│  - Logique métier (votes, sélection, etc.)   │
└───────────────┬──────────────────────────────┘
                │  @supabase/supabase-js
┌───────────────▼──────────────────────────────┐
│                 Supabase                      │
│  Postgres · Auth · Storage · RLS              │
└──────────────────────────────────────────────┘
```

---

## 2. Stack technique

| Domaine | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 15 (App Router)** + React 19 + **TypeScript** | Déploiement Vercel natif, Server Components, Server Actions, un seul repo. |
| Styling | **Tailwind CSS v4** + design tokens custom | Système d'espacements (4/8/16/24/32) et palette du design system directement en config. |
| Polices | **Playfair Display** (titres) + **Inter** (UI) via `next/font` | Élégance « affiche de cinéma » + lisibilité UI. |
| Auth | **Supabase Auth** (email/mot de passe) | Couvre US1/US2 sans backend custom. |
| Base de données | **Supabase Postgres** | Relationnel adapté au modèle (communautés, cycles, votes…). |
| Stockage fichiers | **Supabase Storage** | Photos de profil, affiches, bandes-annonces. |
| Sécurité données | **Row Level Security (RLS)** | Isolation par communauté. |
| Déploiement | **Vercel** | CI/CD Git, preview deployments, variables d'environnement. |
| API externe (V2) | **TMDB** | Import auto des fiches films (US9). |

**Principe clé — Supabase « branchable » :** toute la lecture/écriture passe par une **couche d'accès données** (`lib/data/*`). L'app démarre avec un **adaptateur mock en mémoire** (données de démo) pour développer/visualiser le design sans backend. Dès que les variables `SUPABASE_*` sont présentes, l'adaptateur Supabase prend le relais. Aucun composant UI ne connaît Supabase directement.

---

## 3. Modèle de données (Postgres)

```
profiles            (id → auth.users, pseudo, photo_url, favorite_film,
                     favorite_director, favorite_quote)

communities         (id, name, invite_code, created_by, created_at)
community_members   (community_id, user_id, role[admin|member], joined_at)

moovies             (id, community_id, name, description, theme,
                     start_date, end_date, meeting_date,
                     status[draft|voting|watching|meeting|archived],
                     vote_deadline, max_votes=2)

films               (id, moovie_id, title, poster_url, trailer_url,
                     description, is_selected,
                     -- champs TMDB V2 :
                     tmdb_id, year, runtime, director, genres, tmdb_rating)

votes               (id, moovie_id, film_id, user_id)   -- max 2 / user / moovie

journal_entries     (id, moovie_id, film_id, user_id,
                     type[citation|scene|reflexion|question], content, created_at)

emotions            (id, moovie_id, film_id, user_id,
                     emotion[joie|nostalgie|malaise|fascination|tristesse|espoir|colere],
                     justification, locked=true, created_at)

ratings             (id, moovie_id, film_id, user_id, score 1..10)

meeting_slots       (id, moovie_id, date, start_time, duration_min, is_final)
slot_votes          (id, slot_id, user_id,
                     availability[available|maybe|unavailable])
```

**Règles métier portées par la couche data / Postgres :**
- Vote : contrainte d'unicité `(moovie_id, user_id, film_id)` + limite applicative de 2 votes/Moovie (US11).
- Clôture (US12) : `status` passe à `watching` quand `now > vote_deadline`.
- Sélection auto (US13) : top 2 films par nombre de votes → `is_selected = true`.
- Verrouillage émotions (US18/19) : `emotions` invisibles aux autres tant que `moovies.status != 'meeting'`.
- Créneau optimal (US26) : agrégat des `slot_votes` (disponibles + potentiels / total).

---

## 4. Sécurité (RLS)

- Un utilisateur ne voit/écrit que dans les communautés dont il est membre.
- Les `journal_entries` privées : visibles uniquement par leur auteur.
- Les `emotions` : visibles des autres uniquement si le Moovie est en phase `meeting`.
- Les actions admin (créer Moovie, ajouter film, valider créneau) vérifient `role = 'admin'`.

Les politiques RLS sont définies dans `supabase/migrations/`. Côté serveur, les opérations sensibles utilisent la **clé service role** (jamais exposée au client).

---

## 5. Structure du projet

```
cloovies/
├── app/                          # App Router
│   ├── (auth)/                   # login, signup
│   ├── (app)/                    # zone connectée (bottom nav)
│   │   ├── accueil/              # Home : hero, compte à rebours
│   │   ├── films/                # liste + fiche film + vote
│   │   ├── reflexions/           # journal + émotions
│   │   ├── reunion/              # mode réunion + créneaux
│   │   ├── profil/               # profil, stats, historique
│   │   └── layout.tsx            # bottom navigation
│   ├── join/                     # rejoindre via code/lien
│   ├── layout.tsx                # fonts, thème sombre global
│   └── globals.css               # tokens design
├── components/
│   ├── ui/                       # primitives (Button, Card, Poster…)
│   ├── film/ vote/ emotion/ …    # composants métier
│   └── nav/                      # BottomNav
├── lib/
│   ├── data/                     # COUCHE D'ACCÈS DONNÉES
│   │   ├── index.ts              # sélectionne mock | supabase
│   │   ├── mock/                 # adaptateur démo en mémoire
│   │   ├── supabase/             # adaptateur Supabase
│   │   └── types.ts              # types métier partagés
│   ├── supabase/                 # clients (browser/server)
│   └── utils/
├── supabase/
│   ├── migrations/               # schéma SQL + RLS
│   └── seed.sql                  # données de démo
├── architecture.md  fonctionnalites.md  design.md
├── .env.example
└── ...config (tailwind, next, ts)
```

---

## 6. Design system (rappel des tokens)

- **Couleurs** : bg `#0A0A0A`, surface `#141414`, elevated `#1D1D1D`, border `#2A2A2A`, signature *Burnt Gold* `#C89B3C` (≤ 10% écran). Couleurs émotionnelles réservées à la révélation.
- **Typo** : Playfair Display (titres/citations) · Inter 400/500/600 (UI).
- **Layout** : mobile-first, conteneur max 480px centré, grille d'espacements 4/8/16/24/32.
- **Animations** : 150/250/400ms, courbe `ease-out` uniquement.
- **Navigation** : bottom nav 4 entrées (Accueil · Films · Réflexions · Réunion).
- **Interdits** : glow RGB, néons, effets gaming, animations permanentes.

---

## 7. Déploiement

### Vercel
1. Push du repo Git → import sur Vercel (framework détecté : Next.js).
2. Variables d'environnement (Project Settings → Environment Variables) :

| Variable | Côté | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Clé anon (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | serveur | Opérations privilégiées |
| `TMDB_API_KEY` | serveur | Import films (V2) |

> Sans ces variables, l'app tourne en **mode démo (mock)** — utile pour la preview Vercel et le développement.

### Supabase (mise en place)
1. Créer un projet Supabase.
2. Appliquer les migrations (`supabase/migrations`) via le SQL editor ou la CLI Supabase.
3. Créer les buckets Storage : `avatars`, `posters`.
4. Renseigner les variables dans Vercel → redeploy.

---

## 8. Périmètre & phasage

- **V1 (ce développement)** : auth + profil, communautés (code/lien), Moovies, films candidats manuels, vote 2/Moovie + clôture + sélection top 2, journal, émotions verrouillées/révélées, notation /10 + moyenne, mode réunion, historique/stats, créneaux de réunion.
- **V2** : import TMDB (US9), notifications push, son discret au vote, calendrier exporté (.ics).

---

## 9. Décisions assumées (defaults pragmatiques)

- **Un compte = potentiellement plusieurs communautés**, mais l'UI V1 se concentre sur la communauté active.
- **Vote** : 2 votes max, modifiables tant que `status = voting`.
- **Émotions** : toujours « privées » jusqu'à la réunion (cœur du produit).
- **Mock-first** : permet de livrer une UI navigable immédiatement, Supabase vient ensuite sans toucher aux composants.
