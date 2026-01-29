package core

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte("ta_clé_secrète_super_longue_et_compliquée")

func GenerateToken(id int, email string, role string) (string, error) {
	claims := jwt.MapClaims{
		"id":    id,
		"email": email,
		"role":  role,
		"exp":   time.Now().Add(time.Hour * 24).Unix(),
		"iat":   time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
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
	return nil, fmt.Errorf("invalid token")
}

func VerifAdmin(r *http.Request) bool {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return false
	}
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := ValidateToken(tokenString)
	if err != nil {
		return false
	}
	role, ok := claims["role"].(string)
	return ok && role == "admin"
}
