package auth

import (
	"encoding/json"
	"groupie/internal/core"
	"io"
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
	secretKey := os.Getenv("RECAPTCHA_SECRET_KEY")
	verifyURL := "https://www.google.com/recaptcha/api/siteverify"

	data := url.Values{}
	data.Set("secret", secretKey)
	data.Set("response", token)

	resp, err := http.PostForm(verifyURL, data)
	if err != nil {
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

	return recaptchaResp.Success && recaptchaResp.Score > 0.6, nil
}

// Database helper functions for Auth
func CreateUser(user *User) error {
	query := "INSERT INTO users (email, username, password) VALUES ($1, $2, $3)"
	_, err := core.DB.Exec(query, user.Email, user.Username, user.Password)
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
