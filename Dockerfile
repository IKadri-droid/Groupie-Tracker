# Utilise la version 1.25 pour correspondre à ton go.mod
FROM golang:1.25-alpine

WORKDIR /app

# On copie les fichiers de dépendances
COPY go.mod go.sum ./

# Cette étape ne devrait plus planter
RUN go mod download

COPY . .

# Pour le dev, on garde l'accès à Go.
# Le build final pour prod serait multi-stage, mais pour docker-compose avec Air, on a besoin de Go.
CMD ["go", "run", "main.go"]