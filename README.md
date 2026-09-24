# FaithMatch

Plateforme matrimoniale par compatibilité de foi, de valeurs et de projet de vie. « Pas seulement une rencontre. Une vraie compatibilité. »

Ce dépôt contient une **démo interactive complète**, prête à présenter à un client. Elle tourne entièrement dans le navigateur (aucun serveur, aucune base de données à configurer) : les comptes, profils, matchs, messages et paiements sont simulés et stockés dans le navigateur.

## Lancer la démo

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) (ou le port indiqué dans le terminal).

## Se connecter

Sur l'écran de connexion, section « Accès démo en un clic » :

| Compte | Usage |
|---|---|
| **Ibrahim** / **Aïcha** | Comptes membres déjà remplis : profil complet, matchs, messages, demandes en attente. Pour explorer l'app telle qu'un vrai membre la voit. |
| **Équipe** | Espace d'administration : validations, signalements, membres, paiements. |

Ou directement par URL :
- `/demo/ibrahim`, `/demo/aicha`, `/demo/admin`
- `/demo/nouveau`, `/demo/nouvelle` — crée un compte **vierge** à la volée et ouvre l'onboarding, pratique pour faire la démo de l'inscription en direct sans ressaisir un formulaire à chaque fois.

Le bandeau en haut de l'app propose **Réinitialiser** : repart d'un jeu de données neuf (utile juste avant une présentation).

## Ce que couvre la démo

- **Compatibilité** : questionnaire de 21 questions, score pondéré sur 8 dimensions (religion, valeurs, couple, famille, enfants, finances, mode de vie, distance), points forts et points à discuter expliqués.
- **Découverte, intérêts, matchs** : filtres réciproques, super-intérêts, notifications en temps réel simulé (le simulateur fait vivre l'app : les profils fictifs répondent, likent, visitent).
- **Messagerie modérée** : détection automatique des demandes d'argent et des propos déplacés, avec un scénario d'arnaque prêt à démontrer.
- **Sécurité** : vérification téléphone/selfie, floutage de photo, mode invisible, mode famille (tuteur/wali), signalement, blocage.
- **Abonnement** : Free / Premium / Premium+, paiement Orange Money / Moov Money / Wave / carte (simulé), boost de visibilité.
- **Espace admin** : tableau de bord avec graphiques, file de validation des profils, gestion des signalements, liste des membres, historique des paiements.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · [lucide-react](https://lucide.dev)

Le backend est simulé côté navigateur (`lib/demo/`). Un vrai backend (`supabase/migrations/`, `@supabase/supabase-js`) est amorcé pour le jour où le projet dépasse le stade démo — voir `lib/api.ts`, point d'entrée unique que les pages appellent, à brancher sur Supabase sans toucher à l'interface.

## Vérifier le projet

```bash
npx tsc --noEmit    # types
npx eslint .         # lint
npx next build       # build de production
```
