package auth

import (
	"encoding/json"
	"groupie/internal/core"
	"log"
	"net/http"
)

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	core.EnableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	foundUser, err := GetUserByEmail(req.Email)
	if err != nil {
		http.Error(w, "Identifiants invalides", http.StatusUnauthorized)
		return
	}

	if !CheckPasswordHash(req.Password, foundUser.Password) {
		http.Error(w, "Identifiants invalides", http.StatusUnauthorized)
		return
	}

	token, err := core.GenerateToken(foundUser.ID, foundUser.Email, foundUser.Role)
	if err != nil {
		http.Error(w, "Erreur lors de la création du badge", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Bienvenue !",
		"token":   token,
		"user": map[string]string{
			"email": foundUser.Email,
			"role":  foundUser.Role,
		},
	})
}

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	core.EnableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}
	if r.Method != "POST" {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	isValid, err := VerifyRecaptcha(req.CaptchaToken)
	if err != nil || !isValid {
		http.Error(w, "Vérification captcha échouée", http.StatusBadRequest)
		return
	}

	hashed, _ := HashPassword(req.Password)
	user := User{
		Email:    req.Email,
		Username: req.Username,
		Password: hashed,
	}

	if err := CreateUser(&user); err != nil {
		log.Println("Register error:", err)
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Utilisateur créé !"})
}
