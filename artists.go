package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

// Artist représente un artiste/groupe de musique
type Artist struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Genre string `json:"genre"`
	Year  int    `json:"year"`
}

// handleArtists gère les routes /api/artists
func handleArtists(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/artists")
	path = strings.TrimPrefix(path, "/")

	switch r.Method {
	case "GET":
		if path == "" {
			getAllArtists(w, r)
		} else {
			getArtistByID(w, r, path)
		}
	case "POST":
		createArtist(w, r)
	case "PUT":
		updateArtist(w, r, path)
	case "DELETE":
		deleteArtist(w, r, path)
	default:
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

func getAllArtists(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, genre, formation_year FROM artists ORDER BY id")
	if err != nil {
		http.Error(w, "Erreur base de données: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var artists []Artist
	for rows.Next() {
		var a Artist
		// Use sql.NullString or pointer if fields can be null, assuming simplified for now
		if err := rows.Scan(&a.ID, &a.Name, &a.Genre, &a.Year); err != nil {
			// Handle potential nulls simply or ignore error
			continue
		}
		artists = append(artists, a)
	}

	if artists == nil {
		artists = []Artist{}
	}
	json.NewEncoder(w).Encode(artists)
}

func getArtistByID(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	var a Artist
	err = db.QueryRow("SELECT id, name, genre, formation_year FROM artists WHERE id = $1", id).Scan(&a.ID, &a.Name, &a.Genre, &a.Year)
	if err != nil {
		http.Error(w, "Artiste non trouvé", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(a)
}

func createArtist(w http.ResponseWriter, r *http.Request) {
	var newArtist Artist
	if err := json.NewDecoder(r.Body).Decode(&newArtist); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	err := db.QueryRow(
		"INSERT INTO artists (name, genre, formation_year) VALUES ($1, $2, $3) RETURNING id",
		newArtist.Name, newArtist.Genre, newArtist.Year,
	).Scan(&newArtist.ID)

	if err != nil {
		http.Error(w, "Erreur création: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newArtist)
}

func updateArtist(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	var updatedArtist Artist
	if err := json.NewDecoder(r.Body).Decode(&updatedArtist); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}
	updatedArtist.ID = id

	res, err := db.Exec("UPDATE artists SET name=$1, genre=$2, formation_year=$3 WHERE id=$4",
		updatedArtist.Name, updatedArtist.Genre, updatedArtist.Year, id)
	if err != nil {
		http.Error(w, "Erreur mise à jour", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Artiste non trouvé", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(updatedArtist)
}

func deleteArtist(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	_, err = db.Exec("DELETE FROM artists WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Erreur suppression", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Artiste supprimé"})
}
