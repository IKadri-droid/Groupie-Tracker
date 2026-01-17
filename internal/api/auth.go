package api

import (
	"encoding/json"
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
	if req.Password == "password123" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"token": "ton_super_token_jwt_ici",
			"user":  req.Email,
		})
	} else {
		http.Error(w, "Identifiants invalides", http.StatusUnauthorized)
	}
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

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	hashedPassword, err := services.HashPassword(user.Password)
	if err != nil {
		http.Error(w, "Erreur lors du hashage", http.StatusInternalServerError)
		return
	}
	user.Password = hashedPassword

	if err := models.CreateUser(&user); err != nil {
		http.Error(w, "Erreur 500", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Utilisateur créé !"})
}
