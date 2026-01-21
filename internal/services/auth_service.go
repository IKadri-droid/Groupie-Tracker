package services

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
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

// 1. On définit une clé secrète (Normalement elle va dans le fichier .env !)
var jwtKey = []byte("ta_clé_secrète_super_longue_et_compliquée")

// 2. Création de la fonction

func GenerateToken(id int, email string, admin string) (string, error) {
	// 1. On définit le contenu du jeton (les "Claims")
	claims := jwt.MapClaims{
		"id":    id,    // L'ID de l'utilisateur
		"email": email, // L'identité de l'utilisateur
		"role":  admin,
		"exp":   time.Now().Add(time.Hour * 24).Unix(), // Date d'expiration (dans 24h)
		"iat":   time.Now().Unix(),                     // Date de création ("Issued At")
	}

	// 2. On crée l'objet Token avec l'algorithme de signature HS256
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// 3. On signe le jeton avec notre clé secrète
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func ValidateToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}
