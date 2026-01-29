package artists

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
	Location       string  `json:"location"`
	Date           string  `json:"date"`
	Latitude       float64 `json:"latitude"`
	Longitude      float64 `json:"longitude"`
	ConcertImage   string  `json:"concert_image"`
	Venue          string  `json:"venue"`
	Price          string  `json:"price"`
	AvailableSeats int     `json:"available_seats"`
}

// DEEZER MODELS
type DeezerArtist struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

type DeezerResponse struct {
	Data []DeezerArtist `json:"data"`
}

type DeezerAlbum struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Cover string `json:"cover_medium"`
}

type DeezerAlbumsResponse struct {
	Data []DeezerAlbum `json:"data"`
}

type DeezerTrack struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Preview string `json:"preview"`
}

type DeezerTracksResponse struct {
	Data []DeezerTrack `json:"data"`
}
