# Projet Web Radio - Architecture & Stratégie



## Structure de dossiers proposée

```bash
next-webradios/
├── src/
│   ├── app/                          # App Router Next 16
│   │   ├── (auth)/                   # Groupe de routes auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (main)/                   # Layout principal avec player
│   │   │   ├── layout.tsx            # Layout avec player persistant
│   │   │   ├── page.tsx              # Accueil - liste des radios
│   │   │   └── radio/
│   │   │       └── [id]/
│   │   │           └── page.tsx      # Détail d'une radio
│   │   ├── admin/                    # Routes admin protégées
│   │   │   ├── layout.tsx            # Guard admin
│   │   │   ├── page.tsx              # Dashboard admin
│   │   │   └── radios/
│   │   │       ├── page.tsx          # Liste radios (CRUD)
│   │   │       ├── new/
│   │   │       │   └── page.tsx
│   │   │       └── [id]/
│   │   │           └── edit/
│   │   │               └── page.tsx
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   └── radios/
│   │   │       ├── route.ts          # GET all, POST create
│   │   │       └── [id]/
│   │   │           └── route.ts      # GET one, PUT, DELETE
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # Composants UI génériques
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── player/                   # Composants du player
│   │   │   ├── AudioPlayer.tsx       # Player principal
│   │   │   ├── PlayerControls.tsx
│   │   │   ├── VolumeSlider.tsx
│   │   │   └── NowPlaying.tsx        # Metadata en cours
│   │   ├── radio/
│   │   │   ├── RadioCard.tsx
│   │   │   ├── RadioList.tsx
│   │   │   └── RadioForm.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Sidebar.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts              # Connexion SQLite
│   │   │   ├── schema.sql            # Script création tables
│   │   │   ├── seed.ts               # Données de test
│   │   │   └── queries/
│   │   │       ├── users.ts
│   │   │       ├── radios.ts
│   │   │       └── genres.ts
│   │   ├── auth/
│   │   │   ├── config.ts             # Configuration NextAuth v5
│   │   │   └── helpers.ts
│   │   └── utils/
│   │       ├── cn.ts                 # classnames helper
│   │       └── validators.ts
│   │
│   ├── hooks/
│   │   ├── usePlayer.ts              # Hook du player audio
│   │   ├── useRadios.ts
│   │   └── useAuth.ts
│   │
│   ├── context/
│   │   └── PlayerContext.tsx         # Context pour player persistant
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── radio.ts
│   │   ├── user.ts
│   │   └── auth.ts
│   │
│   └── middleware.ts                 # Protection routes (NextAuth)
│
├── public/
│   └── images/
│
├── prisma/
│   └── schema.prisma                 # Pour plus tard si besoin
│
├── data/
│   └── webradios.db                  # Fichier SQLite
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Points clés de cette structure :
Route Groups (auth) et (main) : permettent d'avoir des layouts différents (le player n'apparaît pas sur les pages login/register)
Séparation claire : lib/ pour la logique métier, components/ pour l'UI, hooks/ pour les hooks custom
API Routes dans app/api/ : RESTful et bien organisées

## Schéma de base de données SQLite

```sql
-- src/lib/db/schema.sql

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des genres musicaux
CREATE TABLE IF NOT EXISTS genres (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des radios
CREATE TABLE IF NOT EXISTS radios (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    stream_url TEXT NOT NULL,
    stream_type TEXT NOT NULL DEFAULT 'mp3' CHECK (stream_type IN ('mp3', 'hls', 'aac', 'ogg')),
    logo_url TEXT,
    description TEXT,
    country TEXT,
    region TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison radios <-> genres (many-to-many)
CREATE TABLE IF NOT EXISTS radio_genres (
    radio_id TEXT NOT NULL REFERENCES radios(id) ON DELETE CASCADE,
    genre_id TEXT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (radio_id, genre_id)
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_radios_name ON radios(name);
CREATE INDEX IF NOT EXISTS idx_radios_active ON radios(is_active);
CREATE INDEX IF NOT EXISTS idx_radios_country ON radios(country);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_genres_slug ON genres(slug);

-- Trigger pour updated_at automatique
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
    FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_radios_timestamp 
    AFTER UPDATE ON radios
    FOR EACH ROW
BEGIN
    UPDATE radios SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

```

```ts
Types TypeScript correspondants :

// src/types/user.ts
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
```

```ts
// src/types/radio.ts
export type StreamType = 'mp3' | 'hls' | 'aac' | 'ogg';

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Radio {
  id: string;
  name: string;
  streamUrl: string;
  streamType: StreamType;
  logoUrl: string | null;
  description: string | null;
  country: string | null;
  region: string | null;
  isActive: boolean;
  genres: Genre[];
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Pour les formulaires
export interface RadioCreateInput {
  name: string;
  streamUrl: string;
  streamType: StreamType;
  logoUrl?: string;
  description?: string;
  country?: string;
  region?: string;
  genreIds?: string[];
}
```

## Stratégie pour le Player Audio Persistant
Ma recommandation : React Context + useRef pour l'élément Audio
Voici pourquoi et comment :

Le problème
Dans Next.js App Router, les navigations entre pages causent un re-render. Si l'élément <audio> est dans un composant de page, il sera détruit et recréé → la musique s'arrête.
