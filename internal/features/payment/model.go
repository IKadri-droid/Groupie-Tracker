package payment

import "time"

type Order struct {
	ID              int       `json:"id"`
	UserID          int       `json:"user_id"`
	ConcertID       int       `json:"concert_id"`
	Amount          float64   `json:"amount"`
	Status          string    `json:"status"`
	StripeSessionID string    `json:"stripe_session_id"`
	CreatedAt       time.Time `json:"created_at"`
}

type OrderHistory struct {
	ID           int     `json:"id"`
	Amount       float64 `json:"amount"`
	Status       string  `json:"status"`
	Location     string  `json:"location"`
	Date         string  `json:"date"`
	Venue        string  `json:"venue"`
	ConcertImage string  `json:"concert_image"`
}
