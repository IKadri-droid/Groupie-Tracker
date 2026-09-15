# 🎵 Groupie Tracker

**Groupie Tracker** est une plateforme web (et mobile via Capacitor) permettant de découvrir des artistes musicaux, de consulter leurs prochaines dates de concert, de gérer ses favoris et d'acheter des tickets en ligne.

Le projet est découpé en deux applications indépendantes :

| Partie | Rôle | Stack |
|---|---|---|
| **Frontend** | Interface utilisateur (recherche, fiches artistes, globe des concerts, compte, paiement) | React 19 + Vite + TanStack Router/Query |
| **Backend** | API REST (auth, données artistes, favoris, paiement) | Go + PostgreSQL |

> 🌐 **Démo en ligne** : [groupie-tracker-ynov.vercel.app](https://groupie-tracker-ynov.vercel.app/)

---

## 🌟 Fonctionnalités

- 🔍 **Recherche d'artistes** en temps réel via l'API Deezer (nom, image, top titres, albums)
- 🌍 **Globe interactif** des dates de concerts (`react-globe.gl` / three.js)
- 👤 **Comptes utilisateurs** : inscription, connexion (JWT), gestion de profil
- ⭐ **Favoris** : sauvegarde des artistes préférés, historique de consultation
- 💳 **Billetterie** : session de paiement Stripe, page de confirmation/annulation
- 🛡️ **Sécurité** : reCAPTCHA v3, rate limiting sur les routes sensibles, CORS configuré
- 📱 **Mobile** : build iOS via Capacitor
- ⚖️ **Pages légales** : mentions légales, politique de confidentialité (RGPD)

---

## 🏗️ Architecture

```
groupie-tracker/
├── frontend/   (React 19 + Vite, port 3000)
│   └── appelle l'API du backend en HTTP (fetch / TanStack Query)
└── backend/    (Go, port 8080)
    └── PostgreSQL + API Deezer + Stripe
```

Le frontend consomme exclusivement l'API REST exposée par le backend ; aucune logique métier (auth, prix, favoris) n'est dupliquée côté client.

### Organisation Git

Les deux applications provenaient historiquement de deux dépôts séparés. Sur ce dépôt, elles cohabitent sous forme de branches préfixées afin de conserver l'intégralité de l'historique de développement de chaque partie :

- `frontend/main`, `frontend/login`, `frontend/docker`, … → toutes les branches du frontend
- `backend/main`, `backend/login`, `backend/docker`, … → toutes les branches du backend

La branche par défaut du dépôt (`frontend/main`) contient le code du frontend ; basculez sur `backend/main` pour le code du backend.

---

## 🛠️ Stack technique

### Frontend (`frontend/main`)
- **Framework** : React 19 (Vite 7)
- **Routing** : TanStack Router (file-based)
- **Data fetching** : TanStack Query
- **UI** : Tailwind CSS 4, Shadcn UI, Radix UI, Framer Motion, Lucide Icons
- **3D / Globe** : three.js, react-globe.gl
- **Formulaires** : React Hook Form + Zod
- **State** : Zustand
- **Mobile** : Capacitor (iOS)
- **Tests** : Vitest

### Backend (`backend/main`)
- **Langage** : Go 1.24
- **Base de données** : PostgreSQL (`lib/pq`)
- **Auth** : JWT (`golang-jwt/jwt`), hashing via `golang.org/x/crypto`
- **Paiement** : Stripe (`stripe-go`)
- **Config** : variables d'environnement via `godotenv`
- **Architecture** : découpage par feature (`internal/features/{artists,auth,payment,user}`) + package `core` (DB, middlewares CORS, rate limiting, tokens)

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js ≥ 20 et npm
- Go ≥ 1.24
- Une base PostgreSQL (locale, Docker, ou hébergée type Neon/Supabase)

Chaque branche de ce dépôt ne contient qu'une seule des deux applications (voir [Organisation Git](#organisation-git)) : clonez le dépôt puis basculez sur la branche voulue avant de suivre les étapes ci-dessous.

### 1. Backend (branche `backend/main`)

```bash
git checkout backend/main
cp .env.example .env
# renseigner DATABASE_URL, RECAPTCHA_SECRET_KEY, STRIPE_SECRET_KEY, PORT
go run .
```

Le serveur écoute par défaut sur `http://localhost:8080`. Les migrations SQL présentes dans `migrations/` sont appliquées automatiquement au démarrage.

Variables d'environnement (`.env`) :

| Variable | Description |
|---|---|
| `DATABASE_URL` | Chaîne de connexion PostgreSQL |
| `RECAPTCHA_SECRET_KEY` | Clé secrète Google reCAPTCHA v3 |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `PORT` | Port d'écoute de l'API (8080 par défaut) |

### 2. Frontend (branche `frontend/main`)

```bash
git checkout frontend/main
cp .env.example .env
# renseigner VITE_RECAPTCHA_SITE_KEY
npm install
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

### Build de production

```bash
# Backend
go build -o groupie-backend .

# Frontend
npm run build
```

### Docker

Chaque application dispose de son propre `Dockerfile` (build multi-stage pour le backend, image `node:20-alpine` en mode dev pour le frontend). Aucun `docker-compose.yml` global n'est fourni actuellement : les deux images sont à construire/lancer séparément, en s'assurant que le frontend pointe vers l'URL du backend et que le backend a accès à sa base de données.

### Mobile (iOS)

```bash
npm run build
npx cap sync ios
npx cap open ios
```

---

## 📡 API (backend)

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/register` | Création de compte |
| `POST` | `/api/login` | Connexion (JWT) |
| `GET` | `/api/artists` | Liste des artistes |
| `GET` | `/api/artists/{id}` | Détail d'un artiste |
| `GET` | `/api/deezer/search` | Recherche d'artiste via Deezer |
| `GET` | `/api/deezer/albums` | Albums d'un artiste (Deezer) |
| `GET` | `/api/deezer/top-tracks` | Top titres d'un artiste (Deezer) |
| `GET` | `/api/profile` | Profil utilisateur connecté |
| `GET` | `/api/history` | Historique de consultation |
| `GET`/`POST` | `/api/favorites` | Gestion des favoris |
| `POST` | `/api/create-checkout-session` | Création d'une session de paiement Stripe |
| `POST` | `/api/confirm-payment` | Confirmation d'un paiement |

Toutes les routes sont protégées par un middleware CORS global ; les routes d'authentification sont en plus soumises à un rate limiting (5 requêtes/minute, blocage 10 minutes en cas d'abus).

---

## 📂 Structure des projets

### Frontend
```
src/
├── routes/       # Pages (file-based routing TanStack Router)
├── features/     # Logique métier par domaine (artists, auth, payment, profile, deezer, globe)
├── shared/       # Composants, config et utilitaires réutilisables
└── integrations/ # Intégrations tierces (TanStack Query)
```

### Backend
```
internal/
├── core/         # DB, migrations, middlewares CORS, rate limiting, tokens
└── features/     # Handlers + services par domaine (artists, auth, payment, user)
migrations/       # Scripts SQL versionnés
```

---

## 🧪 Tests

```bash
# Frontend
npm run test
```

---

*Fait avec ❤️ par Ilyace (ikadri-droid) et Thomas.*
