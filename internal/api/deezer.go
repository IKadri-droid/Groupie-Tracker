package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"groupie/internal/services"
)

// HandleDeezerSearch recherche un artiste sur Deezer
func HandleDeezerSearch(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	name := r.URL.Query().Get("name")
	if name == "" {
		http.Error(w, "Nom de l'artiste manquant", http.StatusBadRequest)
		return
	}

	artist, err := services.GetDeezerArtist(name)
	if err != nil {
		http.Error(w, "Erreur recherche Deezer: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artist)
}

// HandleDeezerAlbums récupère les albums d'un artiste Deezer
func HandleDeezerAlbums(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	artistIDStr := r.URL.Query().Get("artistID")
	if artistIDStr == "" {
		http.Error(w, "ID de l'artiste manquant", http.StatusBadRequest)
		return
	}

	artistID, err := strconv.Atoi(artistIDStr)
	if err != nil {
		http.Error(w, "Erreur conversion ID: "+err.Error(), http.StatusBadRequest)
		return
	}

	albums, err := services.GetDeezerAlbums(artistID)
	if err != nil {
		http.Error(w, "Erreur recherche Deezer: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(albums)
}

// HandleDeezerTopTracks récupère les meilleures pistes d'un artiste Deezer
func HandleDeezerTopTracks(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	artistIDStr := r.URL.Query().Get("artistID")
	if artistIDStr == "" {
		http.Error(w, "ID de l'artiste manquant", http.StatusBadRequest)
		return
	}

	artistID, err := strconv.Atoi(artistIDStr)
	if err != nil {
		http.Error(w, "Erreur conversion ID: "+err.Error(), http.StatusBadRequest)
		return
	}

	tracks, err := services.GetDeezerTopTracks(artistID)
	if err != nil {
		http.Error(w, "Erreur recherche Deezer: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tracks)
}
