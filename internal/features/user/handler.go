package user

import (
	"encoding/json"
	"groupie/internal/core"
	"net/http"
	"strings"
)

func HandleGetProfile(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := core.ValidateToken(tokenString)
	if err != nil {
		http.Error(w, "Accès refusé", 401)
		return
	}

	userID := int(claims["id"].(float64))
	var username, email, role string
	var count int

	err = core.DB.QueryRow("SELECT COALESCE(username, email), email, role FROM users WHERE id = $1", userID).
		Scan(&username, &email, &role)
	if err != nil {
		http.Error(w, "Utilisateur non trouvé", http.StatusNotFound)
		return
	}

	_ = core.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE user_id = $1 AND status = 'paid'", userID).Scan(&count)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"username":    username,
		"email":       email,
		"role":        role,
		"order_count": count,
	})
}

func GetUserHistory(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := core.ValidateToken(tokenString)
	if err != nil {
		http.Error(w, "Invalide", 401)
		return
	}

	history, _ := GetOrdersByUserID(int(claims["id"].(float64)))
	json.NewEncoder(w).Encode(history)
}

func HandleFavorites(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := core.ValidateToken(tokenString)
	if err != nil {
		http.Error(w, "Invalide", 401)
		return
	}
	userID := int(claims["id"].(float64))

	if r.Method == "GET" {
		favs, _ := GetFavoritesByUserID(userID)
		json.NewEncoder(w).Encode(favs)
	} else if r.Method == "POST" {
		var req struct {
			ArtistID int `json:"artist_id"`
		}
		json.NewDecoder(r.Body).Decode(&req)
		AddFavorite(userID, req.ArtistID)
		w.WriteHeader(201)
	}
}
