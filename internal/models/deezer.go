package models

// DeezerArtist représente un artiste Deezer
type DeezerArtist struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

// DeezerResponse représente la réponse de recherche d'artiste Deezer
type DeezerResponse struct {
	Data []DeezerArtist `json:"data"`
}

// DeezerAlbum représente un album Deezer
type DeezerAlbum struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Cover string `json:"cover_medium"`
}

// DeezerAlbumsResponse représente la réponse de liste d'albums Deezer
type DeezerAlbumsResponse struct {
	Data []DeezerAlbum `json:"data"`
}

// DeezerTrack représente une piste Deezer
type DeezerTrack struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Preview string `json:"preview"` // URL audio 30s
}

// DeezerTracksResponse représente la réponse de liste de pistes Deezer
type DeezerTracksResponse struct {
	Data []DeezerTrack `json:"data"`
}
