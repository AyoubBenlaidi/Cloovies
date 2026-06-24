Epic 1 - Gestion des membres
US1 - Création de compte

En tant qu'utilisateur,
je souhaite créer un compte,
afin de participer au club.

US2 - Connexion

En tant qu'utilisateur,
je souhaite me connecter,
afin d'accéder à mes espaces de discussion.

US3 - Gestion du profil

En tant qu'utilisateur,
je souhaite modifier mon profil,
afin de personnaliser mon expérience.

Champs :

Pseudo
- Photo
- Film préféré
- Réalisateur préféré
- Citation cinéma favorite


Epic 2 - Gestion de la communauté
US4 - Rejoindre une communauté

En tant qu'utilisateur,
je souhaite rejoindre une communauté via un code ou un lien,
afin de participer aux activités du club.

US5 - Consulter les membres

En tant qu'utilisateur,
je souhaite voir les membres de la communauté,
afin d'identifier les participants.

Epic 3 - Gestion des cycles ("Moovies")

Un Moovie représente :

une thématique
une période
une sélection de films
un vote
une réunion

Exemple :

Moovie #12
Thème :
"Films de voyage dans le temps"

Durée :
15 Septembre → 15 Octobre

Réunion :
16 Octobre 20h30

US6 - Créer un Moovie

En tant qu'administrateur,
je souhaite créer un nouveau Moovie,
afin de lancer un nouveau cycle.

Paramètres :

Nom
Description
Thématique
Date début
Date fin
Date réunion 
US7 - Consulter les Moovies passés

En tant qu'utilisateur,
je souhaite consulter les anciens Moovies,
afin de revoir l'historique du club.

Epic 4 - Sélection des films
US8 - Ajouter un film candidat

En tant qu'administrateur,
je souhaite ajouter un film à un Moovie,
afin qu'il puisse être soumis au vote.

Champs :

Titre
Affiche 
Bande annonce
Description


US9 - Import automatique (V2)

En tant qu'administrateur,
je souhaite rechercher un film,
afin de récupérer automatiquement ses informations.

API :

TMDB

Données récupérées :

Synopsis
Affiche
Année
Durée
Réalisateur
Acteurs principaux
Genres
Note TMDB
US10 - Consulter une fiche film

En tant qu'utilisateur,
je souhaite consulter une fiche détaillée,
afin de mieux choisir mon vote.

Epic 5 - Vote
US11 - Voter

En tant qu'utilisateur,
je souhaite voter pour mes films préférés,
afin d'influencer la sélection.
2 votes par Moovie


US12 - Clôture automatique

En tant qu'administrateur,
je souhaite définir une date limite,
afin que le vote se termine automatiquement.

US13 - Sélection automatique

En tant qu'administrateur,
je souhaite que les films gagnants soient calculés automatiquement,
afin d'éviter les traitements manuels.

Résultat :
Top 2 retenus


Epic 6 - Espace de visionnage

Une fois les films choisis.

Le Moovie entre dans sa phase la plus importante :

la réflexion personnelle.

US14 - Journal de visionnage

En tant qu'utilisateur,
je souhaite prendre des notes privées,
afin de conserver mes réflexions pendant le visionnage.

Exemples :

scène marquante
citation
question
incompréhension

US16 - Partager une émotion

En tant qu'utilisateur,
je souhaite associer une émotion au film,
afin de préparer la discussion.

Exemples :

Nostalgie
Malaise
Espoir
Colère
Tristesse
Fascination
US17 - Justification libre

En tant qu'utilisateur,
je souhaite expliquer mon émotion,
afin de donner du contexte.

US18 - Verrouillage

En tant qu'utilisateur,
je ne souhaite pas voir les émotions des autres avant la réunion,
afin d'éviter les biais.

US19 - Révélation collective

En tant qu'utilisateur,
je souhaite découvrir les émotions de tous le jour de la réunion,
afin d'alimenter le débat.

Epic 8 - Notation
US20 - Noter un film

En tant qu'utilisateur,
je souhaite attribuer une note sur 10,
afin d'exprimer mon appréciation.

US21 - Consulter les notes du groupe

En tant qu'utilisateur,
je souhaite voir la moyenne du groupe,
afin de comparer mon ressenti.

Epic 9 - Réunion
US22 - Mode réunion

En tant qu'utilisateur,
je souhaite accéder à un écran dédié à la réunion,
afin d'animer les échanges.

Contenu :

émotions révélées
notes moyennes
statistiques


Epic 10 - Historique
US24 - Bibliothèque du club

En tant qu'utilisateur,
je souhaite retrouver tous les films déjà vus,
afin d'éviter les doublons.

US25 - Statistiques personnelles

En tant qu'utilisateur,
je souhaite consulter mon historique,
afin de suivre mon parcours cinématographique.

Indicateurs :
- Films vus
- Genres préférés
- Note moyenne donnée
- Réalisateurs les plus regardés


Epic 9 - Organisation de la réunion

US24 - Proposition de créneaux de réunion

En tant qu'administrateur,
je souhaite proposer plusieurs créneaux de réunion,
afin de trouver une date qui convienne au plus grand nombre.

Critères d'acceptation
L'administrateur peut proposer plusieurs dates/heures.
Chaque créneau possède :
Date
Heure de début
Durée estimée
Les créneaux peuvent être modifiés tant que le vote n'est pas ouvert.
US25 - Vote sur les créneaux

En tant qu'utilisateur,
je souhaite indiquer mes disponibilités sur les créneaux proposés,
afin de faciliter l'organisation de la réunion.

Critères d'acceptation

Pour chaque créneau, l'utilisateur peut choisir :

✅ Disponible
❓ Disponible si nécessaire
❌ Indisponible

Ou alternativement :

Vote multiple sur tous les créneaux compatibles.
US26 - Sélection automatique du créneau

En tant qu'administrateur,
je souhaite identifier automatiquement le créneau optimal,
afin de maximiser la participation.

Règles métier

Le système calcule :

Nombre de participants disponibles
Nombre de participants potentiels
Taux de participation

Le système suggère :

"Créneau recommandé : Vendredi 20h30 (12 disponibles sur 15)"

US27 - Validation du créneau retenu

En tant qu'administrateur,
je souhaite valider le créneau final,
afin de confirmer officiellement la réunion.

Critères d'acceptation
Le créneau sélectionné devient la date officielle du Moovie.
Tous les membres sont notifiés.
Le calendrier de l'événement est mis à jour.