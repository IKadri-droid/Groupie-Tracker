# Backend Groupie Tracker

## Démarrage

Pour lancer le serveur backend, il ne faut **PAS** utiliser `go run main.go` car le projet nécessite d'autres fichiers go.

**Commande correcte :**

```sh
go run .
```

Le serveur démarrera sur `http://localhost:8080`.
Le projet utilise une base de données **PostgreSQL** (configurée via `.env`).

## Configuration

Les variables d'environnement sont chargées depuis le fichier `.env`.
La variable principale est `DATABASE_URL`.
