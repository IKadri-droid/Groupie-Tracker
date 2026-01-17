package services

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPassword transforme un mot de passe en clair en un hash sécurisé
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil // Renvoie true si pas d'erreur, false sinon
}
