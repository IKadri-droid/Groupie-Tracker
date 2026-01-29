package artists

import (
	"database/sql"
	"encoding/json"
	"groupie/internal/core"
	"net/http"
	"strconv"
	"strings"
)

// HandleArtists gère /api/artists
func HandleArtists(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/artists")
	path = strings.TrimPrefix(path, "/")

	switch r.Method {
	case "GET":
		if path == "" {
			getAllArtists(w)
		} else {
			getArtistByID(w, path)
		}
	case "POST":
		if !core.VerifAdmin(r) {
			http.Error(w, "Interdit", http.StatusForbidden)
			return
		}
		createArtist(w, r)
	default:
		http.Error(w, "Non autorisé", http.StatusMethodNotAllowed)
	}
}

func getAllArtists(w http.ResponseWriter) {
	rows, err := core.DB.Query("SELECT id, name, genre, date_last_album, image_url, color FROM artists ORDER BY id")
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	var artists []Artist
	for rows.Next() {
		var a Artist
		var img, col sql.NullString
		rows.Scan(&a.ID, &a.Name, &a.Genre, &a.Year, &img, &col)
		if img.Valid {
			a.ImageURL = img.String
		}
		if col.Valid {
			a.Color = col.String
		}
		concerts, _ := GetConcertsByArtistID(a.ID)
		a.Concerts = concerts
		artists = append(artists, a)
	}
	json.NewEncoder(w).Encode(artists)
}

func getArtistByID(w http.ResponseWriter, idStr string) {
	id, _ := strconv.Atoi(idStr)
	var a Artist
	var img, col sql.NullString
	err := core.DB.QueryRow("SELECT id, name, genre, date_last_album, image_url, color FROM artists WHERE id = $1", id).
		Scan(&a.ID, &a.Name, &a.Genre, &a.Year, &img, &col)
	if err != nil {
		http.Error(w, "Pas trouvé", 404)
		return
	}
	if img.Valid {
		a.ImageURL = img.String
	}
	if col.Valid {
		a.Color = col.String
	}
	concerts, _ := GetConcertsByArtistID(a.ID)
	a.Concerts = concerts
	json.NewEncoder(w).Encode(a)
}

func createArtist(w http.ResponseWriter, r *http.Request) {
	var a Artist
	json.NewDecoder(r.Body).Decode(&a)
	core.DB.QueryRow("INSERT INTO artists (name, genre, date_last_album, image_url, color) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		a.Name, a.Genre, a.Year, a.ImageURL, a.Color).Scan(&a.ID)
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(a)
}

// DEEZER HANDLERS

func HandleDeezerSearch(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	if name == "" {
		name = r.URL.Query().Get("q")
	}

	if name == "" {
		http.Error(w, "Paramètre 'name' ou 'q' manquant", http.StatusBadRequest)
		return
	}

	artist, err := GetDeezerArtist(name)
	if err != nil {
		http.Error(w, "Artiste Deezer non trouvé: "+err.Error(), http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artist)
}

func HandleDeezerAlbums(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("artist_id")
	if idStr == "" {
		idStr = r.URL.Query().Get("artistID") // Support frontend camelCase
	}

	id, err := strconv.Atoi(idStr)
	if err != nil || id == 0 {
		http.Error(w, "ID artiste invalide ou manquant", http.StatusBadRequest)
		return
	}

	albums, err := GetDeezerAlbums(id)
	if err != nil {
		http.Error(w, "Erreur Deezer Albums: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(albums)
}

func HandleDeezerTopTracks(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("artist_id")
	if idStr == "" {
		idStr = r.URL.Query().Get("artistID")
	}

	id, err := strconv.Atoi(idStr)
	if err != nil || id == 0 {
		http.Error(w, "ID artiste invalide ou manquant", http.StatusBadRequest)
		return
	}

	tracks, err := GetDeezerTopTracks(id)
	if err != nil {
		http.Error(w, "Erreur Deezer Tracks: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tracks)
}
