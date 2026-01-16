package api

import (
	"net/http"

	"groupie/internal/services"
)

// HandleConcerts gère la route /api/concerts
func HandleConcerts(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	artistName := r.URL.Query().Get("artist")
	if artistName == "" {
		http.Error(w, "Paramètre 'artist' manquant", http.StatusBadRequest)
		return
	}

	body, err := services.GetConcerts(artistName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write(body)
}
