package models

import (
	"groupie/internal/config"
	"time"
)

// User représente ta table "users" dans la base de données
type User struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	Password  string    `json:"password"`
	CreatedAt time.Time `json:"created_at"`
	Role      string    `json:"role"`
}

func CreateUser(user *User) error {
	query := "INSERT INTO users (email, username, password) Values ($1, $2, $3)"
	_, err := config.DB.Exec(query, user.Email, user.Username, user.Password)
	return err
}

// GetUserByEmail est une fonction de base pour l'authentification
func GetUserByEmail(email string) (*User, error) {
	var user User
	query := "SELECT id, email, username, password, role, created_at FROM users WHERE email = $1"
	err := config.DB.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.Username, &user.Password, &user.Role, &user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
