FROM golang:1.25-alpine

WORKDIR /app

# 1. Copier les fichiers de définition des modules
COPY go.mod go.sum ./

# 2. Télécharger les dépendances (sera mis en cache par Docker)
RUN go mod download

# 3. Copier le reste du code source
COPY . .

# 4. Lancer l'application
CMD ["go", "run", "."]