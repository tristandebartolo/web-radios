# WebRadios

Application de streaming radio moderne construite avec Next.js 16, React 19 et Tailwind CSS 5.

## Fonctionnalités

- Streaming audio HLS et MP3
- Catalogue de radios par genre et pays
- Système de favoris à 3 niveaux (Top, Génial, Énorme)
- Filtres avancés avec persistance localStorage
- Vue grille et liste
- Lecteur audio persistant
- Interface responsive et moderne

## Prérequis

- Node.js 18.17 ou supérieur
- npm 9 ou supérieur

## Installation

```bash
# Cloner le repository
git clone <url-du-repo>
cd next-webradios

# Installer les dépendances
yarn install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Initialiser la base de données
yarn db:push
yarn db:seed

# Lancer le serveur de développement
yarn dev
```

L'application sera accessible sur http://localhost:3000

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Base de données
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-genere-aleatoirement"

# OAuth (optionnel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Pour générer un secret NextAuth :
```bash
openssl rand -base64 32
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `yarn dev` | Lance le serveur de développement |
| `yarn build` | Compile l'application pour la production |
| `yarn start` | Lance le serveur de production |
| `yarn lint` | Vérifie le code avec ESLint |
| `yarn db:push` | Synchronise le schéma Prisma avec la DB |
| `yarn db:seed` | Peuple la DB avec des données de test |
| `yarn db:reset` | Reset complet de la base de données |

## Structure du projet

```
next-webradios/
├── prisma/
│   ├── schema.prisma      # Schéma de la base de données
│   └── seed.ts            # Script de population
├── src/
│   ├── app/               # Routes Next.js (App Router)
│   ├── components/        # Composants React
│   ├── context/           # Contextes React (Player, Favorites)
│   └── lib/               # Utilitaires et configuration
├── public/                # Fichiers statiques
└── ...
```

## Déploiement en production

### Option 1 : Vercel (Recommandé)

1. **Créer un compte Vercel** sur https://vercel.com

2. **Importer le projet**
   - Connectez votre repository GitHub/GitLab
   - Sélectionnez le projet next-webradios

3. **Configurer les variables d'environnement**
   Dans les paramètres du projet Vercel :
   ```
   DATABASE_URL=file:./prod.db
   NEXTAUTH_URL=https://votre-domaine.vercel.app
   NEXTAUTH_SECRET=votre-secret-production
   ```

4. **Déployer**
   - Le déploiement est automatique à chaque push sur main
   - Première fois : cliquez sur "Deploy"

> **Note SQLite** : Pour une application en production avec SQLite sur Vercel, le fichier DB sera recréé à chaque déploiement. Pour la persistance des données, utilisez PostgreSQL ou MySQL (voir Option 3).

### Option 2 : VPS / Serveur dédié

1. **Préparer le serveur**
   ```bash
   # Installer Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Installer PM2 globalement
   yarn add -g pm2
   ```

2. **Cloner et configurer**
   ```bash
   git clone <url-du-repo> /var/www/webradios
   cd /var/www/webradios
   yarn install

   # Configurer l'environnement
   cp .env.example .env.local
   nano .env.local
   ```

3. **Configurer les variables de production**
   ```env
   DATABASE_URL="file:./prod.db"
   NEXTAUTH_URL="https://votre-domaine.com"
   NEXTAUTH_SECRET="secret-long-et-aleatoire"
   NODE_ENV="production"
   ```

4. **Build et initialisation**
   ```bash
   yarn build
   yarn db:push
   yarn db:seed  # Optionnel: données initiales
   ```

5. **Lancer avec PM2**
   ```bash
   pm2 start npm --name "webradios" -- start
   pm2 save
   pm2 startup
   ```

## Mise à jour en production

```bash
# Sur le serveur
cd /var/www/webradios
git pull origin main
npm install
npm run build
npm run db:push  # Si le schéma a changé
pm2 restart webradios
```

## Maintenance

### Sauvegarder la base de données SQLite
```bash
cp prisma/prod.db prisma/backup-$(date +%Y%m%d).db
```

### Logs
```bash
pm2 logs webradios
```

### Monitorer
```bash
pm2 monit
```
