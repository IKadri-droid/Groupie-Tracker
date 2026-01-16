package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
)

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
	Preview string `json:"preview"` // URL audio 30s
}

type DeezerTracksResponse struct {
	Data []DeezerTrack `json:"data"`
}

func getDeezerArtist(name string) (DeezerArtist, error) {
	url := fmt.Sprintf("https://api.deezer.com/search/artist?q=%s", url.QueryEscape(name))
	resp, err := http.Get(url)

	if err != nil {
		return DeezerArtist{}, err
	}
	defer resp.Body.Close()

	var deezerResponse DeezerResponse
	if err := json.NewDecoder(resp.Body).Decode(&deezerResponse); err != nil {
		return DeezerArtist{}, err
	}

	if len(deezerResponse.Data) == 0 {
		return DeezerArtist{}, fmt.Errorf("Aucun artiste trouvé")
	}

	return deezerResponse.Data[0], nil
}

func handleDeezerSearch(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	name := r.URL.Query().Get("name") //get artist name
	if name == "" {
		http.Error(w, "Nom de l'artiste manquant", http.StatusBadRequest)
		return
	}
	artist, err := getDeezerArtist(name) //get artist informations
	if err != nil {
		http.Error(w, "Erreur recherche Deezer: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artist)
}

func getDeezerAlbums(artistID int) ([]DeezerAlbum, error) {
	url := fmt.Sprintf("https://api.deezer.com/artist/%d/albums", artistID)
	resp, err := http.Get(url)
	if err != nil {
		return []DeezerAlbum{}, err
	}
	defer resp.Body.Close()

	var deezerResponse DeezerAlbumsResponse
	if err := json.NewDecoder(resp.Body).Decode(&deezerResponse); err != nil {
		return []DeezerAlbum{}, err
	}

	return deezerResponse.Data, nil
}

func handleDeezerAlbums(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	artistIDStr := r.URL.Query().Get("artistID") //get artist id
	if artistIDStr == "" {
		http.Error(w, "Nom de l'artiste manquant", http.StatusBadRequest)
		return
	}
	// Convertir string en int
	artistID, err := strconv.Atoi(artistIDStr)
	if err != nil {
		http.Error(w, "Erreur conversion ID: "+err.Error(), http.StatusBadRequest)
		return
	}
	albums, err := getDeezerAlbums(artistID)
	if err != nil {
		http.Error(w, "Erreur recherche Deezer: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(albums) // Retourne les albums
}

func getDeezerTopTracks(artistID int) ([]DeezerTrack, error) {
	url := fmt.Sprintf("https://api.deezer.com/artist/%d/top", artistID)
	resp, err := http.Get(url)
	if err != nil {
		return []DeezerTrack{}, err
	}
	defer resp.Body.Close()

	var deezerResponse DeezerTracksResponse
	if err := json.NewDecoder(resp.Body).Decode(&deezerResponse); err != nil {
		return []DeezerTrack{}, err
	}

	return deezerResponse.Data, nil
}

func handleDeezerTopTracks(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	artistIDStr := r.URL.Query().Get("artistID") //get artist id
	if artistIDStr == "" {
		http.Error(w, "Nom de l'artiste manquant", http.StatusBadRequest)
		return
	}
	// Convertir string en int
	artistID, err := strconv.Atoi(artistIDStr)
	if err != nil {
		http.Error(w, "Erreur conversion ID: "+err.Error(), http.StatusBadRequest)
		return
	}
	tracks, err := getDeezerTopTracks(artistID) //get artist informations
	if err != nil {
		http.Error(w, "Erreur recherche Deezer: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tracks)
}
