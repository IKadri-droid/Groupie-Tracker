package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"groupie/internal/config"
	"groupie/internal/models"
)

// HandleArtists gère les routes /api/artists
func HandleArtists(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
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
	rows, err := config.DB.Query("SELECT id, name, genre, date_last_album, image_url, color FROM artists ORDER BY id")
	if err != nil {
		http.Error(w, "Erreur base de données: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var artists []models.Artist
	for rows.Next() {
		var a models.Artist
		var imageURL sql.NullString
		var color sql.NullString
		if err := rows.Scan(&a.ID, &a.Name, &a.Genre, &a.Year, &imageURL, &color); err != nil {
			continue
		}
		if imageURL.Valid {
			a.ImageURL = imageURL.String
		}
		if color.Valid {
			a.Color = color.String
		}
		artists = append(artists, a)
	}

	if artists == nil {
		artists = []models.Artist{}
	}
	json.NewEncoder(w).Encode(artists)
}

func getArtistByID(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	var a models.Artist
	var imageURL sql.NullString
	var color sql.NullString
	err = config.DB.QueryRow("SELECT id, name, genre, date_last_album, image_url, color FROM artists WHERE id = $1", id).Scan(&a.ID, &a.Name, &a.Genre, &a.Year, &imageURL, &color)
	if err != nil {
		http.Error(w, "Artiste non trouvé", http.StatusNotFound)
		return
	}
	if imageURL.Valid {
		a.ImageURL = imageURL.String
	}
	if color.Valid {
		a.Color = color.String
	}

	json.NewEncoder(w).Encode(a)
}

func createArtist(w http.ResponseWriter, r *http.Request) {
	var newArtist models.Artist
	if err := json.NewDecoder(r.Body).Decode(&newArtist); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	err := config.DB.QueryRow(
		"INSERT INTO artists (name, genre, date_last_album, image_url, color) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		newArtist.Name, newArtist.Genre, newArtist.Year, newArtist.ImageURL, newArtist.Color,
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

	var updatedArtist models.Artist
	if err := json.NewDecoder(r.Body).Decode(&updatedArtist); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}
	updatedArtist.ID = id

	res, err := config.DB.Exec("UPDATE artists SET name=$1, genre=$2, date_last_album=$3, image_url=$4, color=$5 WHERE id=$6",
		updatedArtist.Name, updatedArtist.Genre, updatedArtist.Year, updatedArtist.ImageURL, updatedArtist.Color, id)
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

	_, err = config.DB.Exec("DELETE FROM artists WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Erreur suppression", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Artiste supprimé"})
}
