package models

// Artist représente un artiste/groupe de musique
type Artist struct {
	ID       int       `json:"id"`
	Name     string    `json:"name"`
	Genre    string    `json:"genre"`
	Year     int       `json:"year"`
	ImageURL string    `json:"image_url"`
	Color    string    `json:"color"`
	Concerts []Concert `json:"concerts"`
}

type Concert struct {
	ID             int     `json:"id"`
	ArtistID       int     `json:"artist_id"`
	Location       string  `json:"location"`  // ex: "Paris, France"
	Date           string  `json:"date"`      // Pour l'instant string, ou time.Time si tu veux
	Latitude       float64 `json:"latitude"`  // Pour le globe
	Longitude      float64 `json:"longitude"` // Pour le globe
	ConcertImage   string  `json:"concert_image"`
	Venue          string  `json:"venue"`
	Price          string  `json:"price"`
	AvailableSeats int     `json:"available_seats"`
	ConcertImage   string  `json:"image_concert"`
}
