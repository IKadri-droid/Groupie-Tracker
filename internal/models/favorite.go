package models

import (
	"groupie/internal/config"
)

func AddFavorite(userID int, artistID int) error {
	query := `INSERT INTO user_favorites (user_id, artist_id) VALUES ($1, $2)`
	_, err := config.DB.Exec(query, userID, artistID)
	return err
}

func GetFavoritesByUserID(userID int) ([]int, error) {
	query := `SELECT artist_id FROM user_favorites WHERE user_id = $1`

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	favorites := []int{}
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		favorites = append(favorites, id)
	}
	return favorites, nil
}
