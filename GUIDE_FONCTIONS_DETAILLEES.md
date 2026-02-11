# 📋 GUIDE DÉTAILLÉ - TOUTES LES FONCTIONS DU BACKEND

## 🎯 INDEX DES FONCTIONS PAR CATÉGORIE

### CORE (Cœur du système)
- [database.go](#databasego) - 2 fonctions
- [middleware.go](#middlewarego) - 2 fonctions  
- [tokens.go](#tokensgo) - 3 fonctions

### AUTH (Authentification)
- [handler.go](#auth-handlergo) - 2 fonctions
- [service.go](#auth-servicego) - 4 fonctions

### ARTISTS (Artistes)
- [handler.go](#artists-handlergo) - 7 fonctions
- [service.go](#artists-servicego) - 5 fonctions

### USER (Utilisateur)
- [handler.go](#user-handlergo) - 3 fonctions
- [service.go](#user-servicego) - 3 fonctions

### PAYMENT (Paiements)
- [handler.go](#payment-handlergo) - 2 fonctions
- [service.go](#payment-servicego) - 4 fonctions

**TOTAL : 37 fonctions expliquées**

---

## 🔧 CORE - database.go

### 1. `InitDB()` - Initialise la connexion à PostgreSQL

**Signature :**
```go
func InitDB() error
```

**Rôle :** Se connecte à la base de données PostgreSQL au démarrage du serveur

**Étapes :**
1. Charge le fichier `.env` avec `godotenv.Load()`
2. Récupère `DATABASE_URL` (ex: `postgres://user:password@localhost:5432/groupie`)
3. Ouvre la connexion avec `sql.Open("postgres", connStr)`
4. Teste la connexion avec `DB.Ping()`
5. Affiche ✅ si OK, ⚠️ si erreur

**Retourne :** `error` (nil si succès)

**Appelée par :** `main()` au démarrage

---

### 2. `RunMigrations()` - Exécute les scripts SQL

**Signature :**
```go
func RunMigrations() error
```

**Rôle :** Crée/met à jour les tables de la base de données

**Étapes :**
1. Liste les fichiers SQL : `001_create_users_table.sql`, `002_create_orders_table.sql`, etc.
2. Pour chaque fichier :
   - Lit le contenu avec `os.ReadFile()`
   - Exécute le SQL avec `DB.Exec()`
   - Affiche ✅ si OK

**Retourne :** `error` (nil si succès)

**Appelée par :** `main()` après `InitDB()`

---

## 🛡️ CORE - middleware.go

### 3. `EnableCORS(w)` - Active les autorisations CORS

**Signature :**
```go
func EnableCORS(w http.ResponseWriter)
```

**Paramètres :**
- `w` : Objet de réponse HTTP

**Rôle :** Ajoute les en-têtes HTTP pour autoriser le frontend (localhost:3000)

**En-têtes ajoutés :**
- `Access-Control-Allow-Origin: http://localhost:3000`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- `Access-Control-Allow-Credentials: true`

**Appelée par :** Tous les handlers (HandleLogin, HandleRegister, etc.)

---

### 4. `CORSMiddleware(next)` - Middleware global CORS

**Signature :**
```go
func CORSMiddleware(next http.Handler) http.Handler
```

**Paramètres :**
- `next` : Le handler suivant dans la chaîne

**Rôle :** Enveloppe toutes les routes pour activer CORS automatiquement

**Logique :**
1. Appelle `EnableCORS(w)`
2. Si la requête est `OPTIONS` → Répond 200 OK (preflight)
3. Sinon → Passe au handler suivant

**Retourne :** Un nouveau `http.Handler`

**Appelée par :** `main()` ligne 50

---

## 🔐 CORE - tokens.go

### 5. `GenerateToken(id, email, role)` - Crée un token JWT

**Signature :**
```go
func GenerateToken(id int, email string, role string) (string, error)
```

**Paramètres :**
- `id` : ID de l'utilisateur
- `email` : Email de l'utilisateur
- `role` : Rôle ("user" ou "admin")

**Rôle :** Crée un token JWT signé contenant les infos utilisateur

**Contenu du token (claims) :**
- `id` : ID utilisateur
- `email` : Email
- `role` : Rôle
- `exp` : Date d'expiration (24h)
- `iat` : Date de création

**Retourne :** `(token string, error)`

**Exemple de retour :**
```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIn0.xyz123"
```

---

### 6. `ValidateToken(tokenString)` - Vérifie un token JWT

**Signature :**
```go
func ValidateToken(tokenString string) (jwt.MapClaims, error)
```

**Paramètres :**
- `tokenString` : Le token à vérifier

**Rôle :** Vérifie que le token est valide et non expiré

**Étapes :**
1. Parse le token avec `jwt.Parse()`
2. Vérifie la signature avec `jwtKey`
3. Vérifie l'expiration
4. Extrait les claims (id, email, role)

**Retourne :** `(claims, error)` où claims contient `{"id": 1, "email": "...", "role": "user"}`

---

### 7. `VerifAdmin(r)` - Vérifie si l'utilisateur est admin

**Signature :**
```go
func VerifAdmin(r *http.Request) bool
```

**Paramètres :**
- `r` : La requête HTTP

**Rôle :** Vérifie si l'utilisateur qui fait la requête a le rôle "admin"

**Étapes :**
1. Récupère le header `Authorization: Bearer xyz...`
2. Extrait le token
3. Valide le token avec `ValidateToken()`
4. Vérifie si `claims["role"] == "admin"`

**Retourne :** `true` si admin, `false` sinon

**Utilisée par :** `createArtist()` pour protéger la création d'artistes

---

## 🔑 AUTH - handler.go

### 8. `HandleLogin(w, r)` - Connexion utilisateur

**Signature :**
```go
func HandleLogin(w http.ResponseWriter, r *http.Request)
```

**Route :** `POST /api/login`

**Body attendu :**
```json
{
  "email": "test@test.com",
  "password": "123456"
}
```

**Flux :**
1. Active CORS
2. Vérifie que c'est une requête POST
3. Décode le JSON → `LoginRequest`
4. Cherche l'utilisateur avec `GetUserByEmail()`
5. Vérifie le mot de passe avec `CheckPasswordHash()`
6. Génère un token JWT avec `GenerateToken()`
7. Renvoie le token + infos utilisateur

**Réponse (succès) :**
```json
{
  "message": "Bienvenue !",
  "token": "eyJhbGci...",
  "user": {
    "email": "test@test.com",
    "role": "user"
  }
}
```

**Erreurs possibles :**
- 405 : Méthode non POST
- 400 : JSON invalide
- 401 : Email ou mot de passe incorrect

---

### 9. `HandleRegister(w, r)` - Inscription utilisateur

**Signature :**
```go
func HandleRegister(w http.ResponseWriter, r *http.Request)
```

**Route :** `POST /api/register`

**Body attendu :**
```json
{
  "email": "nouveau@test.com",
  "username": "JohnDoe",
  "password": "motdepasse123",
  "captchaToken": "03AGdBq..."
}
```

**Flux :**
1. Active CORS
2. Décode le JSON → `RegisterRequest`
3. Vérifie le captcha Google avec `VerifyRecaptcha()`
4. Hash le mot de passe avec `HashPassword()`
5. Crée l'utilisateur avec `CreateUser()`
6. Renvoie un message de succès

**Réponse (succès) :**
```json
{
  "message": "Utilisateur créé !"
}
```

**Erreurs possibles :**
- 400 : Captcha invalide ou JSON invalide
- 500 : Erreur DB (email déjà utilisé)

---

## 🔧 AUTH - service.go

### 10. `HashPassword(password)` - Crypte un mot de passe

**Signature :**
```go
func HashPassword(password string) (string, error)
```

**Paramètres :**
- `password` : Mot de passe en clair (ex: "123456")

**Rôle :** Transforme le mot de passe en hash bcrypt (irréversible)

**Algorithme :** bcrypt avec coût par défaut (10)

**Exemple :**
- Entrée : `"123456"`
- Sortie : `"$2a$10$N9qo8uLOickgx2ZMRZoMye..."`

**Retourne :** `(hash string, error)`

---

### 11. `CheckPasswordHash(password, hash)` - Vérifie un mot de passe

**Signature :**
```go
func CheckPasswordHash(password, hash string) bool
```

**Paramètres :**
- `password` : Mot de passe saisi par l'utilisateur
- `hash` : Hash stocké en base de données

**Rôle :** Compare le mot de passe avec le hash

**Retourne :** `true` si correspond, `false` sinon

**Utilisée par :** `HandleLogin()` pour vérifier les identifiants

---

### 12. `VerifyRecaptcha(token)` - Vérifie le captcha Google

**Signature :**
```go
func VerifyRecaptcha(token string) (bool, error)
```

**Paramètres :**
- `token` : Token reCAPTCHA v3 du frontend

**Rôle :** Appelle l'API Google pour vérifier que l'utilisateur n'est pas un robot

**Étapes :**
1. Récupère `RECAPTCHA_SECRET_KEY` depuis `.env`
2. Envoie une requête POST à `https://www.google.com/recaptcha/api/siteverify`
3. Lit la réponse : `{success: true, score: 0.9}`
4. Vérifie que `success == true` ET `score > 0.6`

**Retourne :** `(isValid bool, error)`

---

### 13. `CreateUser(user)` - Insère un utilisateur en DB

**Signature :**
```go
func CreateUser(user *User) error
```

**Paramètres :**
- `user` : Pointeur vers un objet User

**Rôle :** Insère un nouvel utilisateur dans la table `users`

**SQL exécuté :**
```sql
INSERT INTO users (email, username, password) VALUES ($1, $2, $3)
```

**Retourne :** `error` (nil si succès)

**Erreur possible :** Violation de contrainte UNIQUE sur email

---

### 14. `GetUserByEmail(email)` - Cherche un utilisateur

**Signature :**
```go
func GetUserByEmail(email string) (*User, error)
```

**Paramètres :**
- `email` : Email à chercher

**Rôle :** Récupère un utilisateur depuis la DB

**SQL exécuté :**
```sql
SELECT id, email, username, password, role, created_at 
FROM users WHERE email = $1
```

**Retourne :** `(*User, error)` - Pointeur vers User ou nil si non trouvé

---

## 🎨 ARTISTS - handler.go

### 15. `HandleArtists(w, r)` - Router principal artistes

**Signature :**
```go
func HandleArtists(w http.ResponseWriter, r *http.Request)
```

**Routes gérées :**
- `GET /api/artists` → `getAllArtists()`
- `GET /api/artists/5` → `getArtistByID("5")`
- `POST /api/artists` → `createArtist()` (admin uniquement)

**Logique :**
1. Extrait le path (`/api/artists/5` → `"5"`)
2. Switch sur la méthode HTTP
3. Vérifie les permissions admin pour POST

---

### 16. `getAllArtists(w)` - Liste tous les artistes

**SQL :**
```sql
SELECT id, name, genre, date_last_album, image_url, color 
FROM artists ORDER BY id
```

**Flux :**
1. Exécute la requête SQL
2. Pour chaque artiste :
   - Récupère ses concerts avec `GetConcertsByArtistID()`
   - Ajoute à la liste
3. Renvoie le JSON

**Réponse :**
```json
[
  {
    "id": 1,
    "name": "Queen",
    "genre": "Rock",
    "year": 1991,
    "concerts": [...]
  }
]
```

---

### 17. `getArtistByID(w, idStr)` - Détails d'un artiste

**Paramètres :**
- `idStr` : ID sous forme de string (ex: "5")

**SQL :**
```sql
SELECT id, name, genre, date_last_album, image_url, color 
FROM artists WHERE id = $1
```

**Retourne :** Un seul artiste avec ses concerts

---

### 18. `createArtist(w, r)` - Créer un artiste (admin)

**Body attendu :**
```json
{
  "name": "Metallica",
  "genre": "Metal",
  "year": 2023,
  "image_url": "https://...",
  "color": "#FF5733"
}
```

**SQL :**
```sql
INSERT INTO artists (name, genre, date_last_album, image_url, color) 
VALUES ($1, $2, $3, $4, $5) RETURNING id
```

**Retourne :** L'artiste créé avec son nouvel ID

---

### 19-21. Handlers Deezer

**`HandleDeezerSearch(w, r)`** - Cherche un artiste sur Deezer
- Query param : `?name=Queen`
- Appelle `GetDeezerArtist(name)`

**`HandleDeezerAlbums(w, r)`** - Albums d'un artiste
- Query param : `?artist_id=123`
- Appelle `GetDeezerAlbums(artistID)`

**`HandleDeezerTopTracks(w, r)`** - Top tracks
- Query param : `?artist_id=123`
- Appelle `GetDeezerTopTracks(artistID)`

---

## 🔧 ARTISTS - service.go

### 22. `GetConcertsByArtistID(artistID)` - Concerts d'un artiste

**SQL :**
```sql
SELECT id, artist_id, location, date, latitude, longitude, 
       image_concert, venue, price, available_seats 
FROM concerts WHERE artist_id = $1
```

**Retourne :** `[]Concert` - Liste de concerts

---

### 23. `getJSON(url, target)` - Helper HTTP

**Rôle :** Fait une requête GET et décode le JSON

**Étapes :**
1. Crée un client HTTP
2. Ajoute le header `User-Agent: GroupieTracker/1.0`
3. Fait la requête GET
4. Décode le JSON dans `target`

**Utilisée par :** Toutes les fonctions Deezer

---

### 24-26. Fonctions Deezer

**`GetDeezerArtist(name)`**
- URL : `https://api.deezer.com/search/artist?q=Queen`
- Retourne : Premier artiste trouvé

**`GetDeezerAlbums(artistID)`**
- URL : `https://api.deezer.com/artist/123/albums`
- Retourne : Liste d'albums

**`GetDeezerTopTracks(artistID)`**
- URL : `https://api.deezer.com/artist/123/top`
- Retourne : Top 25 morceaux

---

## 👤 USER - handler.go

### 27. `HandleGetProfile(w, r)` - Profil utilisateur

**Route :** `GET /api/profile`

**Header requis :** `Authorization: Bearer eyJhbGci...`

**Flux :**
1. Extrait le token JWT
2. Valide avec `ValidateToken()`
3. Récupère l'ID utilisateur
4. Cherche dans la DB
5. Compte les commandes payées

**Réponse :**
```json
{
  "username": "JohnDoe",
  "email": "test@test.com",
  "role": "user",
  "order_count": 3
}
```

---

### 28. `GetUserHistory(w, r)` - Historique des commandes

**Route :** `GET /api/history`

**Flux :**
1. Valide le token
2. Appelle `GetOrdersByUserID()`
3. Renvoie la liste

**Réponse :**
```json
[
  {
    "id": 1,
    "amount": 20.00,
    "status": "paid",
    "location": "Paris",
    "date": "2026-05-15",
    "venue": "Accor Arena"
  }
]
```

---

### 29. `HandleFavorites(w, r)` - Gestion des favoris

**Routes :**
- `GET /api/favorites` → Liste des favoris
- `POST /api/favorites` → Ajouter un favori

**Body POST :**
```json
{
  "artist_id": 5
}
```

**Réponse GET :**
```json
[1, 3, 5, 7]
```

---

## 🔧 USER - service.go

### 30. `AddFavorite(userID, artistID)` - Ajoute un favori

**SQL :**
```sql
INSERT INTO user_favorites (user_id, artist_id) VALUES ($1, $2)
```

---

### 31. `GetFavoritesByUserID(userID)` - Liste des favoris

**SQL :**
```sql
SELECT artist_id FROM user_favorites WHERE user_id = $1
```

**Retourne :** `[]int` - Liste d'IDs d'artistes

---

### 32. `GetOrdersByUserID(userID)` - Historique commandes

**SQL (avec JOIN) :**
```sql
SELECT o.id, o.amount, o.status, c.location, c.date, c.venue, c.image_concert
FROM orders o 
JOIN concerts c ON o.concert_id = c.id 
WHERE o.user_id = $1
```

**Retourne :** `[]OrderHistory`

---

## 💳 PAYMENT - handler.go

### 33. `HandleCreateCheckoutSession(w, r)` - Créer paiement

**Route :** `POST /api/create-checkout-session`

**Body :**
```json
{
  "concert_id": 5
}
```

**Flux :**
1. Valide le token JWT
2. Crée une session Stripe (20€)
3. Insère une commande en DB (status: "pending")
4. Renvoie l'URL de paiement Stripe

**Réponse :**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_xyz123"
}
```

---

### 34. `HandlePaymentConfirm(w, r)` - Confirmer paiement

**Route :** `POST /api/confirm-payment`

**Body :**
```json
{
  "session_id": "cs_test_xyz123"
}
```

**Flux :**
1. Récupère la session Stripe
2. Vérifie si `payment_status == "paid"`
3. Met à jour la commande en DB (status: "paid")
4. Récupère les détails pour l'email
5. Envoie l'email avec QR code (goroutine asynchrone)

---

## 🔧 PAYMENT - service.go

### 35. `SendTicketEmail(...)` - Envoie l'email de confirmation

**Paramètres :** 8 paramètres (email, username, artist, location, date, venue, amount, sessionID)

**Rôle :** Envoie un email HTML avec :
- Détails du concert
- QR code généré via API externe
- Design moderne (gradients, couleurs)

**SMTP :** Gmail (smtp.gmail.com:587)

---

### 36. `CreateOrder(order)` - Crée une commande

**SQL :**
```sql
INSERT INTO orders (user_id, concert_id, amount, status, stripe_session_id) 
VALUES ($1, $2, $3, $4, $5) 
RETURNING id, created_at
```

---

### 37. `UpdateOrderStatusByStripeID(stripeSessionID, status)` - Met à jour

**SQL :**
```sql
UPDATE orders SET status = $1 
WHERE stripe_session_id = $2 AND status != $1
```

**Retourne :** Nombre de lignes affectées

---

### 38. `GetOrderDetailsForEmail(stripeSessionID)` - Détails pour email

**SQL (avec 3 JOINs) :**
```sql
SELECT u.email, u.username, a.name, c.location, c.date, c.venue, o.amount
FROM orders o 
JOIN users u ON o.user_id = u.id 
LEFT JOIN concerts c ON o.concert_id = c.id 
LEFT JOIN artists a ON c.artist_id = a.id
WHERE o.stripe_session_id = $1
```

**Retourne :** 7 valeurs (email, username, artist, location, date, venue, amount)

---

## 📊 RÉCAPITULATIF

| Catégorie | Handlers | Services | Total |
|-----------|----------|----------|-------|
| CORE | 2 | 3 | 5 |
| AUTH | 2 | 4 | 6 |
| ARTISTS | 7 | 5 | 12 |
| USER | 3 | 3 | 6 |
| PAYMENT | 2 | 4 | 6 |
| **TOTAL** | **16** | **19** | **37** |

---

## 🎓 COMMENT LIRE CE GUIDE

1. **Commence par CORE** pour comprendre la base
2. **Puis AUTH** pour la sécurité
3. **Ensuite ARTISTS** pour la logique métier
4. **Termine par USER et PAYMENT**

**Pour chaque fonction, demande-toi :**
- Quand est-elle appelée ?
- Quelles données reçoit-elle ?
- Que fait-elle avec ces données ?
- Que renvoie-t-elle ?

**Bon apprentissage ! 🚀**
