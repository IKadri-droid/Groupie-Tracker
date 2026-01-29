package api

import (
	"groupie/internal/services"
	"net/http"
	"strings"
)

func VerifAdmin(r *http.Request) bool {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return false
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	claims, err := services.ValidateToken(tokenString)
	if err != nil {
		return false
	}

	role, ok := claims["role"].(string)
	return ok && role == "admin"
}
