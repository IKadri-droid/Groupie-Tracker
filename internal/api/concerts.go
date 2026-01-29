package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"groupie/internal/config"
	"groupie/internal/models"
)

func HandleConcerts(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/concerts")
	path = strings.TrimPrefix(path, "/")

	// Sécurité : Seul l'admin peut modifier les concerts
	if r.Method == "POST" || r.Method == "PUT" || r.Method == "DELETE" {
		if !VerifAdmin(r) {
			http.Error(w, "Accès interdit : Administrateurs uniquement", http.StatusForbidden)
			return
		}
	}

	switch r.Method {
	case "POST":
		createConcert(w, r)
	case "PUT":
		updateConcert(w, r, path)
	case "DELETE":
		deleteConcert(w, r, path)
	default:
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// 1. Création d'un concert
func createConcert(w http.ResponseWriter, r *http.Request) {
	var c models.Concert
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	query := `INSERT INTO concerts (artist_id, location, date, venue, price, available_seats, image_concert) 
              VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`

	err := config.DB.QueryRow(query, c.ArtistID, c.Location, c.Date, c.Venue, c.Price, c.AvailableSeats, c.ConcertImage).Scan(&c.ID)
	if err != nil {
		http.Error(w, "Erreur lors de la création du concert", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(c)
}

// 2. Modification d'un concert
func updateConcert(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	var c models.Concert
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	query := `UPDATE concerts SET location=$1, date=$2, venue=$3, price=$4, available_seats=$5, image_concert=$6 
              WHERE id=$7`

	_, err = config.DB.Exec(query, c.Location, c.Date, c.Venue, c.Price, c.AvailableSeats, c.ConcertImage, id)
	if err != nil {
		http.Error(w, "Erreur lors de la mise à jour", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Concert mis à jour avec succès"})
}

// 3. Suppression d'un concert
func deleteConcert(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	_, err = config.DB.Exec("DELETE FROM concerts WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Erreur lors de la suppression", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Concert supprimé"})
}
