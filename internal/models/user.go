package models

import (
	"groupie/internal/config"
	"time"
)

type User struct {
	ID       int       `json:"id"`
	Email    string    `json:"email"`
	Username string    `json:"username"`
	Password string    `json:"-"`
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
