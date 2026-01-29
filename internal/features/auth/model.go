package auth

import "time"

type User struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	Password  string    `json:"password"`
	CreatedAt time.Time `json:"created_at"`
	Role      string    `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email        string `json:"email"`
	Username     string `json:"username"`
	Password     string `json:"password"`
	CaptchaToken string `json:"captchaToken"`
}

type RecaptchaResponse struct {
	Success bool    `json:"success"`
	Score   float64 `json:"score"`
}
