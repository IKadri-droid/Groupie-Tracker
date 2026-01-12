# Utilise Node 22 pour être tranquille avec les exigences de Vite 6
FROM node:22-alpine

WORKDIR /app

# RUN : s'exécute pendant le build (installation des outils)
COPY package*.json ./
RUN npm install

COPY . .

# CMD : s'exécute au démarrage du conteneur (lancement du serveur)
CMD ["npm", "run", "dev"]