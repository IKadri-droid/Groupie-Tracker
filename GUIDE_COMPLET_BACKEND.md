# 📚 GUIDE COMPLET DU BACKEND GROUPIE-TRACKER
## Pour Débutants - Comprendre Tout de A à Z

---

## 🎯 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Technologies utilisées](#technologies-utilisées)
3. [Architecture du projet](#architecture-du-projet)
4. [Comment tout démarre (main.go)](#comment-tout-démarre-maingo)
5. [Le dossier CORE (le cœur)](#le-dossier-core)
6. [Les FEATURES (fonctionnalités)](#les-features)
7. [La base de données](#la-base-de-données)
8. [Le flux complet d'une requête](#le-flux-complet-dune-requête)
9. [Glossaire des termes](#glossaire-des-termes)

---

## 🌟 VUE D'ENSEMBLE

### C'est quoi ce backend ?
C'est un **serveur web** écrit en **Go** (langage de programmation de Google) qui :
- Stocke et gère des données (utilisateurs, artistes, concerts, commandes)
- Répond aux requêtes du frontend (ton site web React)
- Sécurise les connexions avec des tokens JWT
- Gère les paiements via Stripe
- Envoie des emails de confirmation

### Comment ça marche ?
```
Frontend (React) → Envoie une requête HTTP → Backend (Go) → Base de données PostgreSQL
                                                ↓
                                        Répond avec du JSON
```

---

## 🛠️ TECHNOLOGIES UTILISÉES

### 1. **Go (Golang)**
- **C'est quoi ?** Un langage de programmation créé par Google, rapide et simple
- **Pourquoi ?** Parfait pour créer des serveurs web performants
- **Version utilisée :** 1.25.0

### 2. **PostgreSQL**
- **C'est quoi ?** Une base de données (comme Excel, mais pour les serveurs)
- **Pourquoi ?** Pour stocker les utilisateurs, artistes, concerts, commandes

### 3. **Bibliothèques Go (dans `go.mod`)**

| Bibliothèque | Rôle |
|--------------|------|
| `github.com/lib/pq` | Permet à Go de parler avec PostgreSQL |
| `github.com/golang-jwt/jwt/v5` | Crée et vérifie les tokens de sécurité (JWT) |
| `github.com/joho/godotenv` | Lit le fichier `.env` (mots de passe, clés API) |
| `github.com/stripe/stripe-go/v81` | Gère les paiements Stripe |
| `golang.org/x/crypto` | Crypte les mots de passe (bcrypt) |

---

## 📁 ARCHITECTURE DU PROJET

```
backend-groupie/
│
├── main.go                    ← Point d'entrée (démarre tout)
├── go.mod                     ← Liste des dépendances
├── .env                       ← Secrets (mots de passe, clés API)
│
├── internal/
│   ├── core/                  ← Le cœur (DB, CORS, JWT)
│   │   ├── database.go        ← Connexion à PostgreSQL
│   │   ├── middleware.go      ← Gestion CORS (autorisations frontend)
│   │   └── tokens.go          ← Création/validation des JWT
│   │
│   └── features/              ← Fonctionnalités métier
│       ├── auth/              ← Inscription, Connexion
│       ├── artists/           ← Artistes, Concerts, Deezer
│       ├── user/              ← Profil, Favoris, Historique
│       └── payment/           ← Paiements Stripe, Emails
│
└── migrations/                ← Scripts SQL (créer les tables)
    ├── 001_create_users_table.sql
    ├── 002_create_orders_table.sql
    ├── 003_add_concert_details.sql
    └── 004_create_favorites_table.sql
```

### 🎨 Pattern MVC (Model-View-Controller) adapté

Chaque feature suit cette structure :

```
auth/
├── model.go      ← Structures de données (User, LoginRequest...)
├── handler.go    ← Gère les requêtes HTTP (HandleLogin, HandleRegister)
└── service.go    ← Logique métier (HashPassword, CreateUser...)
```

---

## 🚀 COMMENT TOUT DÉMARRE (main.go)

### Ligne par ligne

```go
package main  // Déclare que c'est le fichier principal
```

### 1. **Imports** (lignes 3-12)
```go
import (
    "groupie/internal/core"           // Notre code core
    "groupie/internal/features/auth"  // Notre code auth
    "net/http"                        // Bibliothèque HTTP de Go
    "log"                             // Pour afficher des messages
)
```
**Explication :** On importe les outils dont on a besoin (comme `import React` en JS)

---

### 2. **Fonction main()** (ligne 14)
```go
func main() {
```
**Explication :** C'est LA fonction qui s'exécute quand tu lances le serveur

---

### 3. **Initialisation de la base de données** (lignes 16-18)
```go
if err := core.InitDB(); err != nil {
    log.Fatal("❌ Database connection failed:", err)
}
defer core.DB.Close()
```

**Traduction :**
1. `core.InitDB()` → Appelle la fonction qui connecte à PostgreSQL
2. `if err != nil` → Si ça plante, affiche l'erreur et arrête tout
3. `defer core.DB.Close()` → Quand le programme s'arrête, ferme proprement la connexion

---

### 4. **Exécution des migrations** (lignes 21-23)
```go
if err := core.RunMigrations(); err != nil {
    log.Fatal("❌ Migrations failed:", err)
}
```

**Traduction :** Exécute les fichiers SQL pour créer les tables (users, orders, etc.)

---

### 5. **Définition des routes** (lignes 28-47)

```go
http.HandleFunc("/api/login", auth.HandleLogin)
```

**Traduction :**
- Quand quelqu'un envoie une requête à `http://localhost:8080/api/login`
- Go appelle la fonction `auth.HandleLogin`

**Toutes les routes :**

| URL | Fonction | Rôle |
|-----|----------|------|
| `/api/login` | `auth.HandleLogin` | Connexion utilisateur |
| `/api/register` | `auth.HandleRegister` | Inscription |
| `/api/artists` | `artists.HandleArtists` | Liste/Détail artistes |
| `/api/deezer/search` | `artists.HandleDeezerSearch` | Chercher un artiste sur Deezer |
| `/api/profile` | `user.HandleGetProfile` | Profil utilisateur |
| `/api/favorites` | `user.HandleFavorites` | Favoris utilisateur |
| `/api/create-checkout-session` | `payment.HandleCreateCheckoutSession` | Créer paiement Stripe |
| `/api/confirm-payment` | `payment.HandlePaymentConfirm` | Confirmer paiement |

---

### 6. **Application du middleware CORS** (ligne 50)
```go
handler := core.CORSMiddleware(http.DefaultServeMux)
```

**Traduction :** Enveloppe toutes les routes pour autoriser les requêtes du frontend (localhost:3000)

---

### 7. **Démarrage du serveur** (lignes 52-54)
```go
port := ":8080"
fmt.Println("🚀 Server started on http://localhost:8080")
log.Fatal(http.ListenAndServe(port, handler))
```

**Traduction :** Lance le serveur sur le port 8080 et attend les requêtes

---

## 🧠 LE DOSSIER CORE

### 1. `database.go` - Connexion PostgreSQL

#### **Fonction `InitDB()`**
```go
func InitDB() error {
    // 1. Charge le fichier .env
    godotenv.Load()
    
    // 2. Récupère l'URL de connexion
    connStr := os.Getenv("DATABASE_URL")
    
    // 3. Ouvre la connexion
    DB, err = sql.Open("postgres", connStr)
    
    // 4. Vérifie que ça marche
    if err = DB.Ping(); err != nil {
        log.Println("⚠️ DB connection failed")
    }
    return nil
}
```

**Explication simple :**
1. Lit `.env` pour trouver `DATABASE_URL=postgres://user:password@localhost:5432/groupie`
2. Se connecte à PostgreSQL
3. Teste avec un "ping" (comme tester ta connexion internet)

---

#### **Fonction `RunMigrations()`**
```go
func RunMigrations() error {
    files := []string{
        "migrations/001_create_users_table.sql",
        "migrations/002_create_orders_table.sql",
        // ...
    }
    
    for _, file := range files {
        content, _ := os.ReadFile(file)        // Lit le fichier SQL
        DB.Exec(string(content))               // Exécute le SQL
    }
}
```

**Explication :** Lit chaque fichier `.sql` et exécute les commandes SQL (CREATE TABLE, etc.)

---

### 2. `middleware.go` - Gestion CORS

#### **Fonction `EnableCORS()`**
```go
func EnableCORS(w http.ResponseWriter) {
    w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}
```

**Explication :**
- **Problème :** Par défaut, un site sur `localhost:3000` ne peut pas appeler `localhost:8080`
- **Solution :** On ajoute des en-têtes HTTP pour dire "C'est OK, j'autorise"

---

#### **Fonction `CORSMiddleware()`**
```go
func CORSMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        EnableCORS(w)                    // Active CORS
        if r.Method == "OPTIONS" {       // Si c'est une requête OPTIONS
            w.WriteHeader(http.StatusOK) // Répond juste OK
            return
        }
        next.ServeHTTP(w, r)             // Sinon, continue vers la vraie route
    })
}
```

**Explication :** Enveloppe toutes les routes pour activer CORS automatiquement

---

### 3. `tokens.go` - Sécurité JWT

#### **Fonction `GenerateToken()`**
```go
func GenerateToken(id int, email string, role string) (string, error) {
    claims := jwt.MapClaims{
        "id":    id,
        "email": email,
        "role":  role,
        "exp":   time.Now().Add(time.Hour * 24).Unix(), // Expire dans 24h
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtKey)  // Signe avec la clé secrète
}
```

**Explication simple :**
1. Crée un "badge" numérique contenant l'ID, email, rôle
2. Le crypte avec une clé secrète
3. Renvoie une longue chaîne de caractères (le token)

**Exemple de token :**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIn0.xyz123
```

---

#### **Fonction `ValidateToken()`**
```go
func ValidateToken(tokenString string) (jwt.MapClaims, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return jwtKey, nil  // Utilise la même clé secrète
    })
    
    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        return claims, nil  // Renvoie les données (id, email, role)
    }
    return nil, fmt.Errorf("invalid token")
}
```

**Explication :** Vérifie que le token n'a pas été modifié et n'est pas expiré

---

#### **Fonction `VerifAdmin()`**
```go
func VerifAdmin(r *http.Request) bool {
    authHeader := r.Header.Get("Authorization")         // Récupère "Bearer xyz123..."
    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    claims, err := ValidateToken(tokenString)
    
    role, ok := claims["role"].(string)
    return ok && role == "admin"  // Vérifie si role == "admin"
}
```

**Explication :** Vérifie si l'utilisateur qui fait la requête est admin

---

## 🎭 LES FEATURES

### 1. **AUTH (Authentification)**

#### **Structure des fichiers**

##### `model.go` - Les structures de données
```go
type User struct {
    ID        int       `json:"id"`
    Email     string    `json:"email"`
    Username  string    `json:"username"`
    Password  string    `json:"password"`  // Hash bcrypt
    CreatedAt time.Time `json:"created_at"`
    Role      string    `json:"role"`      // "user" ou "admin"
}
```

**Explication :** C'est comme un "moule" pour créer des utilisateurs

---

##### `handler.go` - Gestion des requêtes HTTP

**Fonction `HandleLogin()`**
```go
func HandleLogin(w http.ResponseWriter, r *http.Request) {
    // 1. Active CORS
    core.EnableCORS(w)
    
    // 2. Vérifie que c'est une requête POST
    if r.Method != "POST" {
        http.Error(w, "Méthode non autorisée", 405)
        return
    }
    
    // 3. Lit le JSON envoyé par le frontend
    var req LoginRequest
    json.NewDecoder(r.Body).Decode(&req)  // req = {email: "...", password: "..."}
    
    // 4. Cherche l'utilisateur dans la DB
    foundUser, err := GetUserByEmail(req.Email)
    if err != nil {
        http.Error(w, "Identifiants invalides", 401)
        return
    }
    
    // 5. Vérifie le mot de passe
    if !CheckPasswordHash(req.Password, foundUser.Password) {
        http.Error(w, "Identifiants invalides", 401)
        return
    }
    
    // 6. Génère un token JWT
    token, _ := core.GenerateToken(foundUser.ID, foundUser.Email, foundUser.Role)
    
    // 7. Renvoie le token au frontend
    json.NewEncoder(w).Encode(map[string]interface{}{
        "message": "Bienvenue !",
        "token":   token,
        "user": map[string]string{
            "email": foundUser.Email,
            "role":  foundUser.Role,
        },
    })
}
```

**Flux complet :**
```
Frontend envoie → {email: "test@test.com", password: "123456"}
                    ↓
Backend vérifie → Cherche dans la DB
                    ↓
                  Compare les mots de passe (bcrypt)
                    ↓
                  Génère un token JWT
                    ↓
Frontend reçoit → {token: "eyJhbGci...", user: {...}}
```

---

**Fonction `HandleRegister()`**
```go
func HandleRegister(w http.ResponseWriter, r *http.Request) {
    // 1. Lit les données
    var req RegisterRequest
    json.NewDecoder(r.Body).Decode(&req)
    
    // 2. Vérifie le captcha Google
    isValid, _ := VerifyRecaptcha(req.CaptchaToken)
    if !isValid {
        http.Error(w, "Captcha échoué", 400)
        return
    }
    
    // 3. Hash le mot de passe
    hashed, _ := HashPassword(req.Password)  // "123456" → "$2a$10$xyz..."
    
    // 4. Crée l'utilisateur
    user := User{
        Email:    req.Email,
        Username: req.Username,
        Password: hashed,
    }
    
    // 5. Insère dans la DB
    CreateUser(&user)
    
    // 6. Répond OK
    json.NewEncoder(w).Encode(map[string]string{"message": "Utilisateur créé !"})
}
```

---

##### `service.go` - Logique métier

**Fonction `HashPassword()`**
```go
func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    return string(bytes), err
}
```

**Explication :**
- **Entrée :** `"123456"`
- **Sortie :** `"$2a$10$N9qo8uLOickgx2ZMRZoMye..."`
- **Pourquoi ?** On ne stocke JAMAIS les mots de passe en clair (sécurité)

---

**Fonction `CheckPasswordHash()`**
```go
func CheckPasswordHash(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

**Explication :** Compare le mot de passe saisi avec le hash stocké

---

**Fonction `CreateUser()`**
```go
func CreateUser(user *User) error {
    query := "INSERT INTO users (email, username, password) VALUES ($1, $2, $3)"
    _, err := core.DB.Exec(query, user.Email, user.Username, user.Password)
    return err
}
```

**Explication :**
1. Prépare une requête SQL
2. `$1, $2, $3` sont remplacés par les valeurs
3. Exécute `INSERT INTO users...`

---

### 2. **ARTISTS (Artistes)**

#### **Structure des fichiers**

##### `model.go`
```go
type Artist struct {
    ID       int       `json:"id"`
    Name     string    `json:"name"`
    Genre    string    `json:"genre"`
    Year     int       `json:"year"`
    ImageURL string    `json:"image_url"`
    Color    string    `json:"color"`
    Concerts []Concert `json:"concerts"`  // Liste de concerts
}

type Concert struct {
    ID             int     `json:"id"`
    Location       string  `json:"location"`
    Date           string  `json:"date"`
    Latitude       float64 `json:"latitude"`
    Longitude      float64 `json:"longitude"`
    Venue          string  `json:"venue"`
    Price          string  `json:"price"`
    AvailableSeats int     `json:"available_seats"`
}
```

---

##### `handler.go`

**Fonction `HandleArtists()`**
```go
func HandleArtists(w http.ResponseWriter, r *http.Request) {
    path := strings.TrimPrefix(r.URL.Path, "/api/artists/")
    
    switch r.Method {
    case "GET":
        if path == "" {
            getAllArtists(w)        // /api/artists
        } else {
            getArtistByID(w, path)  // /api/artists/5
        }
    case "POST":
        if !core.VerifAdmin(r) {
            http.Error(w, "Interdit", 403)
            return
        }
        createArtist(w, r)
    }
}
```

**Explication :**
- `GET /api/artists` → Liste tous les artistes
- `GET /api/artists/5` → Détails de l'artiste ID 5
- `POST /api/artists` → Créer un artiste (admin uniquement)

---

**Fonction `getAllArtists()`**
```go
func getAllArtists(w http.ResponseWriter) {
    // 1. Requête SQL
    rows, _ := core.DB.Query("SELECT id, name, genre, date_last_album, image_url, color FROM artists")
    defer rows.Close()
    
    // 2. Boucle sur les résultats
    var artists []Artist
    for rows.Next() {
        var a Artist
        rows.Scan(&a.ID, &a.Name, &a.Genre, &a.Year, &a.ImageURL, &a.Color)
        
        // 3. Récupère les concerts de cet artiste
        concerts, _ := GetConcertsByArtistID(a.ID)
        a.Concerts = concerts
        
        artists = append(artists, a)
    }
    
    // 4. Renvoie en JSON
    json.NewEncoder(w).Encode(artists)
}
```

**Explication :**
1. Récupère tous les artistes de la DB
2. Pour chaque artiste, récupère ses concerts
3. Renvoie le tout en JSON

---

##### `service.go`

**Fonction `GetConcertsByArtistID()`**
```go
func GetConcertsByArtistID(artistID int) ([]Concert, error) {
    query := `SELECT id, location, date, latitude, longitude, venue, price, available_seats 
              FROM concerts WHERE artist_id = $1`
    
    rows, _ := core.DB.Query(query, artistID)
    defer rows.Close()
    
    var concerts []Concert
    for rows.Next() {
        var c Concert
        rows.Scan(&c.ID, &c.Location, &c.Date, &c.Latitude, &c.Longitude, &c.Venue, &c.Price, &c.AvailableSeats)
        concerts = append(concerts, c)
    }
    return concerts, nil
}
```

---

**Intégration Deezer**

**Fonction `GetDeezerArtist()`**
```go
func GetDeezerArtist(name string) (DeezerArtist, error) {
    // 1. Construit l'URL de l'API Deezer
    apiURL := fmt.Sprintf("https://api.deezer.com/search/artist?q=%s", url.QueryEscape(name))
    
    // 2. Fait une requête HTTP GET
    var res DeezerResponse
    getJSON(apiURL, &res)
    
    // 3. Renvoie le premier résultat
    return res.Data[0], nil
}
```

**Explication :** Appelle l'API publique de Deezer pour chercher un artiste

---

### 3. **USER (Utilisateur)**

##### `handler.go`

**Fonction `HandleGetProfile()`**
```go
func HandleGetProfile(w http.ResponseWriter, r *http.Request) {
    // 1. Récupère le token JWT
    authHeader := r.Header.Get("Authorization")  // "Bearer eyJhbGci..."
    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    
    // 2. Valide le token
    claims, err := core.ValidateToken(tokenString)
    if err != nil {
        http.Error(w, "Accès refusé", 401)
        return
    }
    
    // 3. Récupère l'ID utilisateur du token
    userID := int(claims["id"].(float64))
    
    // 4. Cherche dans la DB
    var username, email, role string
    core.DB.QueryRow("SELECT username, email, role FROM users WHERE id = $1", userID).
        Scan(&username, &email, &role)
    
    // 5. Renvoie les infos
    json.NewEncoder(w).Encode(map[string]interface{}{
        "username": username,
        "email":    email,
        "role":     role,
    })
}
```

**Flux :**
```
Frontend envoie → Header: Authorization: Bearer eyJhbGci...
                    ↓
Backend décode → Extrait l'ID utilisateur
                    ↓
                  Cherche dans la DB
                    ↓
Frontend reçoit → {username: "...", email: "...", role: "user"}
```

---

### 4. **PAYMENT (Paiements)**

##### `handler.go`

**Fonction `HandleCreateCheckoutSession()`**
```go
func HandleCreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
    // 1. Vérifie le token
    claims, _ := core.ValidateToken(tokenString)
    userID := int(claims["id"].(float64))
    
    // 2. Lit le concert_id
    var req struct {
        ConcertID int `json:"concert_id"`
    }
    json.NewDecoder(r.Body).Decode(&req)
    
    // 3. Crée une session Stripe
    stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
    params := &stripe.CheckoutSessionParams{
        SuccessURL: stripe.String("http://localhost:3000/success"),
        CancelURL:  stripe.String("http://localhost:3000/cancel"),
        LineItems: []*stripe.CheckoutSessionLineItemParams{{
            PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
                Currency:   stripe.String("eur"),
                UnitAmount: stripe.Int64(2000),  // 20.00 €
            },
            Quantity: stripe.Int64(1),
        }},
    }
    s, _ := session.New(params)
    
    // 4. Crée une commande en DB
    CreateOrder(&Order{
        UserID:          userID,
        ConcertID:       req.ConcertID,
        Amount:          20,
        Status:          "pending",
        StripeSessionID: s.ID,
    })
    
    // 5. Renvoie l'URL de paiement
    json.NewEncoder(w).Encode(map[string]string{"url": s.URL})
}
```

**Flux :**
```
Frontend → Clique "Acheter"
            ↓
Backend → Crée session Stripe
            ↓
          Crée commande en DB (status: "pending")
            ↓
Frontend → Redirige vers Stripe
            ↓
Utilisateur → Paie
            ↓
Stripe → Redirige vers /success?session_id=xyz
            ↓
Frontend → Appelle /api/confirm-payment
            ↓
Backend → Met à jour status: "paid"
            ↓
          Envoie email avec QR code
```

---

##### `service.go`

**Fonction `SendTicketEmail()`**
```go
func SendTicketEmail(toEmail, username, artist, location, date, venue string, amount float64, sessionID string) error {
    // 1. Configuration SMTP Gmail
    from := os.Getenv("EMAIL_SENDER")
    password := os.Getenv("EMAIL_PASSWORD")
    smtpHost := "smtp.gmail.com"
    smtpPort := "587"
    
    // 2. Construit le HTML
    body := fmt.Sprintf(`
        <h1>Commande Confirmée !</h1>
        <p>Artiste: %s</p>
        <p>Lieu: %s</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?data=%s">
    `, artist, location, sessionID)
    
    // 3. Envoie l'email
    message := []byte("Subject: Votre billet\n" + body)
    auth := smtp.PlainAuth("", from, password, smtpHost)
    return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, message)
}
```

---

## 🗄️ LA BASE DE DONNÉES

### Tables créées par les migrations

#### 1. **users** (001_create_users_table.sql)
```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,              -- Auto-incrémenté (1, 2, 3...)
    email TEXT UNIQUE NOT NULL,         -- Unique = pas de doublons
    username TEXT,
    password TEXT NOT NULL,             -- Hash bcrypt
    created_at TIMESTAMP DEFAULT NOW(),
    role TEXT DEFAULT 'user'            -- "user" ou "admin"
);
```

**Exemple de données :**
| id | email | username | password | role |
|----|-------|----------|----------|------|
| 1 | test@test.com | JohnDoe | $2a$10$xyz... | user |
| 2 | admin@groupie.com | Admin | $2a$10$abc... | admin |

---

#### 2. **orders** (002_create_orders_table.sql)
```sql
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,  -- Clé étrangère
    concert_id INTEGER,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',                           -- "pending" ou "paid"
    stripe_session_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Exemple :**
| id | user_id | concert_id | amount | status | stripe_session_id |
|----|---------|------------|--------|--------|-------------------|
| 1 | 1 | 5 | 20.00 | paid | cs_test_xyz123 |

---

#### 3. **concerts** (003_add_concert_details.sql)
```sql
ALTER TABLE concerts ADD COLUMN venue TEXT;
ALTER TABLE concerts ADD COLUMN price TEXT;
ALTER TABLE concerts ADD COLUMN available_seats INTEGER DEFAULT 0;
```

---

#### 4. **user_favorites** (004_create_favorites_table.sql)
```sql
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id INTEGER REFERENCES users(id),
    artist_id INTEGER,
    PRIMARY KEY (user_id, artist_id)  -- Pas de doublons
);
```

---

## 🔄 LE FLUX COMPLET D'UNE REQUÊTE

### Exemple : Connexion utilisateur

```
1. Frontend (React)
   ↓
   fetch("http://localhost:8080/api/login", {
       method: "POST",
       headers: {"Content-Type": "application/json"},
       body: JSON.stringify({email: "test@test.com", password: "123456"})
   })

2. Backend (Go) - main.go
   ↓
   http.HandleFunc("/api/login", auth.HandleLogin)
   ↓
   CORSMiddleware enveloppe la requête

3. auth/handler.go - HandleLogin()
   ↓
   Lit le JSON → {email: "...", password: "..."}
   ↓
   Appelle GetUserByEmail(email)

4. auth/service.go - GetUserByEmail()
   ↓
   SELECT * FROM users WHERE email = 'test@test.com'
   ↓
   Renvoie l'utilisateur trouvé

5. auth/handler.go (suite)
   ↓
   Vérifie le mot de passe avec bcrypt
   ↓
   Génère un token JWT

6. core/tokens.go - GenerateToken()
   ↓
   Crée un token signé
   ↓
   Renvoie "eyJhbGci..."

7. auth/handler.go (fin)
   ↓
   Renvoie JSON : {token: "...", user: {...}}

8. Frontend (React)
   ↓
   Stocke le token dans localStorage
   ↓
   Redirige vers /dashboard
```

---

## 📖 GLOSSAIRE DES TERMES

### **API (Application Programming Interface)**
Interface qui permet à deux programmes de communiquer (ex: Frontend ↔ Backend)

### **Backend**
La partie "serveur" d'une application (invisible pour l'utilisateur)

### **CORS (Cross-Origin Resource Sharing)**
Mécanisme de sécurité des navigateurs qui bloque les requêtes entre domaines différents

### **Database (Base de données)**
Système de stockage de données structurées (comme Excel, mais pour les serveurs)

### **Endpoint**
Une URL spécifique d'une API (ex: `/api/login`)

### **Frontend**
La partie "client" d'une application (ce que voit l'utilisateur)

### **Handler**
Fonction qui gère une requête HTTP

### **Hash**
Transformation irréversible d'un mot de passe (ex: "123456" → "$2a$10$xyz...")

### **HTTP (HyperText Transfer Protocol)**
Protocole de communication web

### **JSON (JavaScript Object Notation)**
Format de données léger (ex: `{"name": "John", "age": 30}`)

### **JWT (JSON Web Token)**
Token de sécurité crypté contenant des informations utilisateur

### **Middleware**
Fonction qui s'exécute avant/après une requête (ex: CORS, authentification)

### **Migration**
Script SQL pour créer/modifier la structure de la base de données

### **Model**
Structure de données (ex: `type User struct {...}`)

### **PostgreSQL**
Système de gestion de base de données relationnelle

### **Query**
Requête SQL (ex: `SELECT * FROM users`)

### **REST API**
Architecture d'API utilisant HTTP (GET, POST, PUT, DELETE)

### **Route**
Association entre une URL et une fonction (ex: `/api/login` → `HandleLogin`)

### **Service**
Couche de logique métier (entre handler et database)

### **SQL (Structured Query Language)**
Langage pour interroger les bases de données

### **Struct**
Type de données personnalisé en Go (comme une classe en POO)

### **Token**
Chaîne de caractères cryptée servant d'identifiant de session

---

## 🎓 RÉSUMÉ POUR DÉBUTANT

### Ce que fait ton backend :

1. **Démarre** (`main.go`)
   - Se connecte à PostgreSQL
   - Crée les tables (migrations)
   - Définit les routes
   - Lance le serveur sur le port 8080

2. **Reçoit des requêtes** du frontend
   - `/api/login` → Connexion
   - `/api/register` → Inscription
   - `/api/artists` → Liste des artistes
   - `/api/profile` → Profil utilisateur
   - `/api/create-checkout-session` → Paiement

3. **Traite les requêtes**
   - Vérifie les permissions (JWT)
   - Interroge la base de données
   - Appelle des APIs externes (Deezer, Stripe)
   - Envoie des emails

4. **Renvoie des réponses** en JSON
   - `{token: "...", user: {...}}`
   - `{artists: [...]}`
   - `{url: "https://checkout.stripe.com/..."}`

---

## 🚀 PROCHAINES ÉTAPES

Pour aller plus loin :

1. **Teste les routes avec Postman**
   - Envoie des requêtes manuellement
   - Comprends les réponses JSON

2. **Modifie une route simple**
   - Ajoute un champ dans `User`
   - Modifie `HandleGetProfile()` pour le renvoyer

3. **Crée une nouvelle feature**
   - Exemple : Système de commentaires
   - Crée `comments/model.go`, `handler.go`, `service.go`

4. **Apprends SQL**
   - Pratique les requêtes `SELECT`, `INSERT`, `UPDATE`, `DELETE`

5. **Comprends les patterns**
   - MVC (Model-View-Controller)
   - REST API
   - JWT Authentication

---

## 📞 AIDE SUPPLÉMENTAIRE

Si tu as des questions sur :
- Une fonction spécifique → Demande-moi de l'expliquer
- Un concept → Je peux créer des schémas
- Un bug → On débuggera ensemble

**Bon courage ! 🎉**
