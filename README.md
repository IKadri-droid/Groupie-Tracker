# Backend Groupie Tracker

## Démarrage

Pour lancer le serveur backend, il ne faut **PAS** utiliser `go run main.go` car cela ne compile que le fichier `main.go`.

**Commande correcte :**

```sh
go run .
```

Le serveur démarrera sur `http://localhost:8080` et se connectera par défaut à Neo4j sur `localhost:7687` (utilisateur: `neo4j`, mot de passe: `password`).

## Configuration (Optionnel)

Si vous avez besoin de changer la configuration, vous pouvez définir ces variables d'environnement :

- `NEO4J_URI`
- `NEO4J_USER`
- `NEO4J_PASS`

Ou utiliser le script PowerShell fourni : `.\run_dev.ps1`
