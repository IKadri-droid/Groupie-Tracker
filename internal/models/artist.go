package models

// Artist représente un artiste/groupe de musique
type Artist struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Genre    string `json:"genre"`
	Year     int    `json:"year"`
	ImageURL string `json:"image_url"`
	Color    string `json:"color"`
}
