package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"groupie/internal/models"
)

// GetDeezerArtist recherche un artiste sur Deezer par nom
func GetDeezerArtist(name string) (models.DeezerArtist, error) {
	apiURL := fmt.Sprintf("https://api.deezer.com/search/artist?q=%s", url.QueryEscape(name))
	resp, err := http.Get(apiURL)

	if err != nil {
		return models.DeezerArtist{}, err
	}
	defer resp.Body.Close()

	var deezerResponse models.DeezerResponse
	if err := json.NewDecoder(resp.Body).Decode(&deezerResponse); err != nil {
		return models.DeezerArtist{}, err
	}

	if len(deezerResponse.Data) == 0 {
		return models.DeezerArtist{}, fmt.Errorf("aucun artiste trouvé")
	}

	return deezerResponse.Data[0], nil
}

// GetDeezerAlbums récupère les albums d'un artiste Deezer
func GetDeezerAlbums(artistID int) ([]models.DeezerAlbum, error) {
	apiURL := fmt.Sprintf("https://api.deezer.com/artist/%d/albums", artistID)
	resp, err := http.Get(apiURL)
	if err != nil {
		return []models.DeezerAlbum{}, err
	}
	defer resp.Body.Close()

	var deezerResponse models.DeezerAlbumsResponse
	if err := json.NewDecoder(resp.Body).Decode(&deezerResponse); err != nil {
		return []models.DeezerAlbum{}, err
	}

	return deezerResponse.Data, nil
}

// GetDeezerTopTracks récupère les meilleures pistes d'un artiste Deezer
func GetDeezerTopTracks(artistID int) ([]models.DeezerTrack, error) {
	apiURL := fmt.Sprintf("https://api.deezer.com/artist/%d/top", artistID)
	resp, err := http.Get(apiURL)
	if err != nil {
		return []models.DeezerTrack{}, err
	}
	defer resp.Body.Close()

	var deezerResponse models.DeezerTracksResponse
	if err := json.NewDecoder(resp.Body).Decode(&deezerResponse); err != nil {
		return []models.DeezerTrack{}, err
	}

	return deezerResponse.Data, nil
}
