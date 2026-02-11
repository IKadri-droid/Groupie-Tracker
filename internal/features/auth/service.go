package auth

import (
	"encoding/json"
	"groupie/internal/core"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func VerifyRecaptcha(token string) (bool, error) {
	// Bypass pour le développement
	if token == "dev-bypass-token" {
		log.Println("ℹ️  reCAPTCHA bypassed via dev-bypass-token")
		return true, nil
	}

	secretKey := os.Getenv("RECAPTCHA_SECRET_KEY")

	if secretKey == "" {
		log.Println("⚠️  RECAPTCHA_SECRET_KEY non configurée dans le .env")
		return true, nil // On laisse passer si non configuré pour pas bloquer le dev
	}

	verifyURL := "https://www.google.com/recaptcha/api/siteverify"

	data := url.Values{}
	data.Set("secret", secretKey)
	data.Set("response", token)

	resp, err := http.PostForm(verifyURL, data)
	if err != nil {
		log.Println("❌ Erreur lors de la requête Recaptcha:", err)
		return false, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, err
	}

	var recaptchaResp RecaptchaResponse
	if err := json.Unmarshal(body, &recaptchaResp); err != nil {
		return false, err
	}

	if !recaptchaResp.Success {
		return false, nil
	}

	// Si c'est du v3, on vérifie le score
	if recaptchaResp.Score > 0 && recaptchaResp.Score < 0.5 {
		log.Printf("⚠️  Recaptcha score trop faible: %v\n", recaptchaResp.Score)
		return false, nil
	}

	return true, nil
}

// Database helper functions for Auth
func CreateUser(user *User) error {
	query := "INSERT INTO users (email, username, password) VALUES ($1, $2, $3)"
	_, err := core.DB.Exec(query, user.Email, user.Username, user.Password)
	return err
}

func CreateGoogleUser(user *User, googleID string) error {
	query := "INSERT INTO users (email, username, google_id, password) VALUES ($1, $2, $3, $4)"
	_, err := core.DB.Exec(query, user.Email, user.Username, googleID, "") // Mot de passe vide pour Google
	return err
}

func GetUserByEmail(email string) (*User, error) {
	var user User
	query := "SELECT id, email, username, password, role, created_at FROM users WHERE email = $1"
	err := core.DB.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.Username, &user.Password, &user.Role, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
