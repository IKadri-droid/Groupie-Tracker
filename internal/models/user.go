package models

import (
	"groupie/internal/config"
	"time"
)

type User struct {
	ID       int       `json:"id"`
	Email    string    `json:"email"`
	Username string    `json:"username"`
	Password string    `json:"password"`
	CreateAt time.Time `json:"Date de création"`
}

func CreateUser(user *User) error {
	query := "INSERT INTO users (email, username, password) Values ($1, $2, $3)"
	_, err := config.DB.Exec(query, user.Email, user.Username, user.Password)

	if err != nil {
		return err
	}
	return nil
}

func GetUserByEmail(email string) (*User, error) {
	var user User

	query := "SELECT id, email, username, password, created_at FROM users WHERE email = $1"
	// 2. On exécute et on scanne une SEULE fois
	// On met tous les champs dans l'ordre du SELECT
	err := config.DB.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Username,
		&user.Password,
		&user.CreateAt,
	)
	// 3. Il faut ABSOLUMENT vérifier l'erreur ici
	if err != nil {
		return nil, err // Si on ne trouve rien, on renvoie "vide" et l'erreur
	}
	// 4. On renvoie l'adresse de l'utilisateur trouvé
	return &user, nil
}
