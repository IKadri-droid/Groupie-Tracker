package user

import (
	"groupie/internal/core"
	"groupie/internal/features/payment"
)

// SERVICE / DB LOGIC
func AddFavorite(userID int, artistID int) error {
	_, err := core.DB.Exec("INSERT INTO user_favorites (user_id, artist_id) VALUES ($1, $2)", userID, artistID)
	return err
}

func GetFavoritesByUserID(userID int) ([]int, error) {
	rows, err := core.DB.Query("SELECT artist_id FROM user_favorites WHERE user_id = $1", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var favs []int
	for rows.Next() {
		var id int
		rows.Scan(&id)
		favs = append(favs, id)
	}
	return favs, nil
}

func GetOrdersByUserID(userID int) ([]payment.OrderHistory, error) {
	query := `SELECT o.id, o.amount, o.status, c.location, c.date, c.venue, c.image_concert
              FROM orders o JOIN concerts c ON o.concert_id = c.id WHERE o.user_id = $1`
	rows, err := core.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var history []payment.OrderHistory
	for rows.Next() {
		var h payment.OrderHistory
		rows.Scan(&h.ID, &h.Amount, &h.Status, &h.Location, &h.Date, &h.Venue, &h.ConcertImage)
		history = append(history, h)
	}
	return history, nil
}
