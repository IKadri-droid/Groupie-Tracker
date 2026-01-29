package models

import (
	"groupie/internal/config"
	"time"
)

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

func CreateOrder(order *Order) error {
	query := `INSERT INTO orders (user_id, concert_id, amount, status, stripe_session_id) 
              VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`
	err := config.DB.QueryRow(query, order.UserID, order.ConcertID, order.Amount, order.Status, order.StripeSessionID).Scan(&order.ID, &order.CreatedAt)
	if err != nil {
		return err
	}
	return nil
}

func UpdateOrderStatusByStripeID(stripeSessionID string, status string) (int64, error) {
	// On n'update que si le statut n'est pas déjà celui qu'on veut mettre
	query := `UPDATE orders SET status = $1 WHERE stripe_session_id = $2 AND status != $1`
	res, err := config.DB.Exec(query, status, stripeSessionID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func GetOrdersByUserID(userID int) ([]OrderHistory, error) {
	query := `SELECT orders.id, orders.amount, orders.status, concerts.location, concerts.date, concerts.venue, concerts.image_concert
              FROM orders
              JOIN concerts ON orders.concert_id = concerts.id
              WHERE orders.user_id = $1`

	history := []OrderHistory{}

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var h OrderHistory
		err := rows.Scan(&h.ID, &h.Amount, &h.Status, &h.Location, &h.Date, &h.Venue, &h.ConcertImage)
		if err != nil {
			return nil, err
		}
		history = append(history, h)
	}

	return history, nil
}

// GetOrderDetailsForEmail récupère les infos nécessaires pour envoyer le ticket par mail
func GetOrderDetailsForEmail(stripeSessionID string) (email, username, artist, location, date, venue string, amount float64, err error) {
	query := `
		SELECT 
			u.email, u.username, 
			COALESCE(a.name, 'Artiste Inconnu'), 
			COALESCE(c.location, 'Lieu non spécifié'), 
			COALESCE(CAST(c.date AS VARCHAR), 'Date à confirmer'), 
			COALESCE(c.venue, 'Salle à confirmer'),
			o.amount
		FROM orders o
		JOIN users u ON o.user_id = u.id
		LEFT JOIN concerts c ON o.concert_id = c.id
		LEFT JOIN artists a ON c.artist_id = a.id
		WHERE o.stripe_session_id = $1
	`
	err = config.DB.QueryRow(query, stripeSessionID).Scan(
		&email, &username, &artist, &location, &date, &venue, &amount,
	)
	return
}
