package api

import (
	"encoding/json"
	"groupie/internal/config"
	"groupie/internal/services" // Pour valider le Token
	"net/http"
	"strings"
)

// HandleGetProfile est la fonction qui va répondre au Front-end
func HandleGetProfile(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// 1. On vérifie qui est l'utilisateur via son Token (Sécurité)
	authHeader := r.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := services.ValidateToken(tokenString)
	if err != nil {
		http.Error(w, "Session expirée", http.StatusUnauthorized)
		return
	}

	userID := int(claims["id"].(float64))

	// 2. Toute la logique SQL est ici (comme tu le souhaitais)
	var username, email, role string
	var orderCount int

	err = config.DB.QueryRow("SELECT username, email, role FROM users WHERE id = $1", userID).
		Scan(&username, &email, &role)
	if err != nil {
		http.Error(w, "Utilisateur introuvable", http.StatusNotFound)
		return
	}

	config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE user_id = $1 AND status = 'paid'", userID).Scan(&orderCount)

	// 3. On renvoie le résultat au format JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"username":    username,
		"email":       email,
		"role":        role,
		"order_count": orderCount,
	})
}
