package models

import (
	"groupie/internal/config"
	"time"
)

// Order représente un achat de billet dans notre base de données
type Order struct {
	ID              int       `json:"id"`
	UserID          int       `json:"user_id"`
	ConcertID       int       `json:"concert_id"`
	Amount          float64   `json:"amount"`            // Prix payé
	Status          string    `json:"status"`            // "pending", "paid", "failed"
	StripeSessionID string    `json:"stripe_session_id"` // L'identifiant donné par Stripe
	CreatedAt       time.Time `json:"created_at"`
}

// CreateOrder enregistre une nouvelle commande en base de données
func CreateOrder(order *Order) error {
	query := `INSERT INTO orders (user_id, concert_id, amount, status, stripe_session_id) 
              VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`
	err := config.DB.QueryRow(query, order.UserID, order.ConcertID, order.Amount, order.Status, order.StripeSessionID).Scan(&order.ID, &order.CreatedAt)
	if err != nil {
		return err
	}
	return nil
}

// UpdateOrderStatusByStripeID met à jour le statut d'une commande via son ID Stripe
func UpdateOrderStatusByStripeID(stripeSessionID string, status string) error {
	query := `UPDATE orders SET status = $1 WHERE stripe_session_id = $2`
	_, err := config.DB.Exec(query, status, stripeSessionID)
	return err
}
