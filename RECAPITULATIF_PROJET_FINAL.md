# 🎓 Récapitulatif Final du Projet : Groupie-Tracker

Ce document contient toutes les informations techniques nécessaires pour le projet, afin que vous ne perdiez rien même si vous ne pouvez plus pousser sur le dépôt distant.

## 🚀 Architecture Globale
*   **Backend** : Go (Golang) avec une architecture modulaire par fonctionnalités (`internal/features`).
*   **Base de Données** : PostgreSQL (Neon pour la production).
*   **Paiement** : Intégration Stripe.
*   **Authentification** : JWT (JSON Web Tokens) & Google OAuth2.
*   **Musique** : Intégration API Deezer.

## 🔑 Variables d'Environnement (Nécessaires)
Assurez-vous d'avoir un fichier `.env` avec :
*   `DATABASE_URL` : Lien de connexion PostgreSQL.
*   `JWT_SECRET` : Clé secrète pour les tokens.
*   `STRIPE_SECRET_KEY` : Clé Stripe pour les paiements.
*   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` : Pour l'auth Google.
*   `RECAPTCHA_SECRET` : Pour la protection du registre.
*   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` : Pour les emails de confirmation.

## 🛠️ Endpoints API Principaux

### Authentification
*   `POST /api/login` : Connexion utilisateur.
*   `POST /api/register` : Inscription avec reCAPTCHA.
*   `GET /api/auth/google/login` : Login via Google.

### Artistes & Musique
*   `GET /api/artists` : Liste complète des artistes et leurs concerts.
*   `GET /api/artists/{id}` : Détails d'un artiste.
*   `POST /api/artists` : Création (Admin uniquement).
*   `GET /api/deezer/search` : Recherche d'artistes sur Deezer.

### Profil & Favoris (Protégés par Token)
*   `GET /api/profile` : Infos de l'utilisateur connecté.
*   `GET /api/history` : Historique des achats.
*   `GET /api/favorites` : Liste des favoris.
*   `POST /api/favorites` : Ajouter un favori.

### Paiements (Stripe)
*   `POST /api/create-checkout-session` : Initier un achat de billet.
*   `POST /api/confirm-payment` : Validation après succès Stripe.

## 📦 Fichiers de Documentation Inclus
1.  **`GroupieTracker.postman_collection.json`** : Contient tous les tests documentés (Headers, Body, Descriptions).
2.  **`GUIDE_COMPLET_BACKEND.md`** : Guide exhaustif sur le code source.
3.  **`GUIDE_FONCTIONS_DETAILLEES.md`** : Explications des algorithmes.

## 💾 Comment sauvegarder votre travail ?
Puisque le push est bloqué, vous pouvez :
1.  **Télécharger une archive** de tout le dossier local.
2.  **Copier-coller** le contenu de la collection Postman dans un fichier local pour l'importer dans votre Postman personnel.
3.  **Exporter votre DB** si nécessaire (via pg_dump).

---
**Bravo pour le travail accompli sur ce projet !**
