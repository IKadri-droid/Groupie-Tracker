package api

import (
	"encoding/json"
	"log"
	"net/http"

	"groupie/internal/models"
	"groupie/internal/services"
)

// HandleLogin gère l'authentification
func HandleLogin(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	// Simulation : on accepte n'importe quel email avec le mot de passe "password123"
	// 1. On demande au dossier 'models' de nous trouver l'utilisateur par son mail
	foundUser, err := models.GetUserByEmail(req.Email)

	// 2. Si on a une erreur (utilisateur non trouvé), on s'arrête là
	if err != nil {
		http.Error(w, "Identifiants invalides", http.StatusUnauthorized)
		return
	}
	match := services.CheckPasswordHash(req.Password, foundUser.Password)
	if !match {
		http.Error(w, "identifiants invalides", http.StatusUnauthorized)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	// 1. On appelle le service pour créer le VRAI badge
	token, err := services.GenerateToken(foundUser.Email, foundUser.Role)
	if err != nil {
		http.Error(w, "Erreur lors de la création du badge", http.StatusInternalServerError)
		return
	}

	// 2. On met le 'token' dans la réponse
	response := map[string]interface{}{
		"message": "Bienvenue !",
		"token":   token, // <-- On utilise la variable ici !
		"user": map[string]string{
			"email": foundUser.Email,
			"role":  foundUser.Role,
		},
	}

	// On envoie cet objet complet
	json.NewEncoder(w).Encode(response)
}

// Structure pour recevoir les données d'inscription avec le captcha
type RegisterRequest struct {
	Email        string `json:"email"`
	Username     string `json:"username"`
	Password     string `json:"password"`
	CaptchaToken string `json:"captchaToken"`
}

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}
	//CAPTCHA
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}
	// Vérifier le captcha
	isValid, err := services.VerifyRecaptcha(req.CaptchaToken)
	if err != nil || !isValid {
		log.Println("Captcha verification failed:", err)
		http.Error(w, "Vérification captcha échouée", http.StatusBadRequest)
		return
	}
	// Créer l'objet User à partir de la requête
	user := models.User{
		Email:    req.Email,
		Username: req.Username,
		Password: req.Password,
	}
	//FIN CAPTCHA
	hashedPassword, err := services.HashPassword(user.Password)
	if err != nil {
		http.Error(w, "Erreur lors du hashage", http.StatusInternalServerError)
		return
	}
	user.Password = hashedPassword

	if err := models.CreateUser(&user); err != nil {
		// 1. D'abord, on écrit dans NOTRE terminal (les logs)
		log.Println("Hé Chef, y a une erreur :", err)

		// 2. Ensuite, on envoie le message d'erreur au client
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)

		// 3. Et on quitte la fonction
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Utilisateur créé !"})
}
