package models

// LoginRequest représente une requête de connexion
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
