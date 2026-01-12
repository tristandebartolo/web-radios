# CLAUDE.md - Guide de développement WebRadios

## Présentation du projet

WebRadios est une application Next.js de streaming radio moderne. Elle permet aux utilisateurs d'écouter des radios du monde entier avec support des flux HLS et MP3, de gérer leurs favoris avec trois niveaux de préférence, et de découvrir de nouvelles stations par genre et pays.

## Stack technique

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19
- **Styling**: Tailwind CSS 5
- **Base de données**: SQLite avec Prisma ORM
- **Authentification**: NextAuth v5 (beta)
- **Audio**: HLS.js pour le streaming
- **Langage**: TypeScript

## Commandes principales

```bash
# Développement
yarn dev          # Lance le serveur de développement

# Base de données
yarn db:push      # Pousse le schéma Prisma vers la DB
yarn db:seed      # Peuple la DB avec les données de test
yarn db:reset     # Reset complet de la DB (supprime, push, seed)

# Production
yarn build        # Build de production
yarn start        # Lance le serveur de production
```

⚠️ **IMPORTANT:** Toujours utiliser yarn.

## Structure du projet

```
src/
├── app/                    # Routes Next.js (App Router)
│   ├── (auth)/            # Routes d'authentification
│   ├── (main)/            # Routes principales (radios, favorites)
│   │   ├── radios/        # Liste et détail des radios
│   │   └── favorites/     # Page des favoris
│   ├── admin/             # Administration
│   └── api/               # Routes API
├── components/
│   ├── auth/              # Composants d'authentification
│   ├── player/            # Lecteur audio (PlayerBar, PlayButton)
│   └── radio/             # Composants radio (RadioCard, RadioGrid, etc.)
├── context/
│   ├── PlayerContext.tsx  # État global du lecteur
│   └── FavoritesContext.tsx # Gestion des favoris (localStorage)
└── lib/
    ├── db/                # Configuration Prisma
    └── utils/             # Utilitaires (cn, etc.)
```

## Architecture des composants

### Layouts
- `app/layout.tsx` - Layout racine avec tous les providers (Auth, Favorites, Player) et PlayerBar
- `app/(main)/layout.tsx` - Layout des pages principales avec navigation

### Contextes
- **PlayerContext** - Gère l'état de lecture (radio courante, play/pause, volume)
- **FavoritesContext** - Gère les favoris avec 3 niveaux (Top, Génial, Énorme), persistés en localStorage

### Pages principales
- `/` - Page d'accueil avec présentation
- `/radios` - Liste des radios avec filtres avancés (genre, pays, tri, recherche)
- `/radios/[id]` - Détail d'une radio avec radios similaires
- `/favorites` - Gestion des favoris avec filtres

## Schéma de base de données

### Modèles principaux
- **Radio** - Stations radio avec streamUrl, logoUrl, genres, pays, URLs sociales
- **Genre** - Catégories musicales (relation many-to-many avec Radio)
- **User** - Utilisateurs (NextAuth)
- **Account/Session** - Gestion des sessions (NextAuth)

### Champs Radio importants
```prisma
model Radio {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  streamUrl   String
  streamType  StreamType  // HLS ou MP3
  logoUrl     String?
  description String?
  country     String?
  isActive    Boolean  @default(true)
  websiteUrl  String?
  facebookUrl String?
  twitterUrl  String?
  youtubeUrl  String?
  genres      Genre[]
}
```

## Conventions de code

### Composants
- Les composants serveur sont dans les fichiers `page.tsx`
- Les composants clients utilisent la directive `'use client'` et sont suffixés `*Client.tsx`
- Les wrappers pour composants clients dans les pages serveur sont suffixés `*Client.tsx`

### Styles
- Utilisation de classes Tailwind avec la syntaxe CSS variables: `text-(--muted)`, `bg-(--primary)`
- Composant `glass` pour les effets de transparence
- Composant `gradient-text` pour les titres avec dégradé

### État
- Filtres persistés en localStorage avec clé `webradios_*`
- Hydratation gérée avec état `isHydrated` pour éviter les mismatches SSR

## Points d'attention

1. **PlayerBar** - Doit être dans le layout racine pour persister sur toutes les pages
2. **PlayButton** - Gère deux cas: avec radio (cards) ou sans (PlayerBar)
3. **Favoris** - Système côté client uniquement (localStorage), pas de sync serveur
4. **Slug des radios** - Généré à partir du nom, normalisé (sans accents, lowercase)

## Débogage courant

- **Player ne joue pas**: Vérifier le type de stream (HLS vs MP3) et l'URL
- **Filtres non persistés**: Vérifier la clé localStorage et l'état isHydrated
- **Erreur Prisma**: Exécuter `npm run db:push` après modification du schéma
