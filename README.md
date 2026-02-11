# 🎵 Groupie Tracker - Backend 🚀

Bienvenue dans le "cerveau" de Groupie Tracker ! Ce dossier contient toute la logique et les données qui permettent au site de fonctionner correctement.

---

## 📝 C'est quoi ce projet ?

**Groupie Tracker** est une plateforme moderne permettant de découvrir des artistes musicaux, de consulter leurs prochaines dates de concert et de gérer ses artistes favoris. 

Imaginez cela comme un annuaire musical intelligent et interactif.

---

## 🧠 Comment ça marche ? (Simplement)

Pour que vous puissiez voir les photos des artistes et leurs dates de concert, le projet est divisé en deux parties :

1.  **Le Backend (ce dossier)** : C'est le moteur. Il va chercher les informations sur les artistes, sécurise vos comptes utilisateurs, et gère les paiements pour les tickets. Sans lui, le site serait une coquille vide.
2.  **Le Frontend** : C'est la partie visible (l'interface). C'est ce que vous utilisez pour cliquer, faire défiler et admirer le design.

---

## 🚀 Comment accéder au site ?

Pour faire fonctionner le site sur votre ordinateur, suivez ces étapes simples :

### 🛠️ Pré-requis
Assurez-vous d'avoir installé **Docker Desktop** sur votre machine. C'est l'outil qui permet de lancer le projet en un clic sans se soucier des réglages compliqués.

### 🏃 Lancement rapide (Recommandé)
1. Ouvrez un terminal à la racine du projet global.
2. Tapez la commande suivante :
   ```bash
   docker-compose up --build
   ```
3. Attendez quelques instants que "la machine" démarre.

### 🌐 Accès au site
Une fois lancé, vous pouvez accéder au site via votre navigateur :
- 🏠 **Le Site Web (Interface) :** [http://localhost:3000](http://localhost:3000)
- ⚙️ **Le Serveur (Données) :** [http://localhost:8080](http://localhost:8080)
- 🏠 **Le Site Web (en ligne):**[https://groupie-tracker-ynov.vercel.app/]
- ⚙️ **"Lorsque le site Web est en ligne vous pouvez directement y accédez grace a l'url du groupie si dessus"**

---

## 🌟 Fonctionnalités clés

- 🔍 **Recherche Intelligente** : Trouvez vos artistes préférés instantanément.
- 📅 **Calendrier de Concerts** : Ne ratez aucune date de tournée.
- 👤 **Espace Client** : Créez un compte pour sauvegarder vos favoris.
- 💳 **Billetterie** : Système de réservation de tickets (via Stripe).
- 📧 **Confirmations** : Envoi automatique d'emails après vos achats.

---

## 🛠️ Un coup d'œil sous le capot
*Pour ceux qui veulent en savoir un tout petit peu plus...*

Ce backend est construit avec **Go**, un langage réputé pour sa rapidité. Il communique avec une base de données pour se souvenir de tout ce que vous faites sur le site.

---
*Fait avec ❤️ par Ilyace et Thomas.*
