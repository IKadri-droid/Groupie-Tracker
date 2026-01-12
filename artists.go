package main

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
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

	// Gestion des requêtes preflight CORS
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Extraire l'ID de l'URL si présent
	path := strings.TrimPrefix(r.URL.Path, "/api/artists")
	path = strings.TrimPrefix(path, "/")

	switch r.Method {
	case "GET":
		if path == "" {
			// GET /api/artists - Liste tous les artistes
			getAllArtists(w, r)
		} else {
			// GET /api/artists/{id} - Récupère un artiste par ID
			getArtistByID(w, r, path)
		}
	case "POST":
		// POST /api/artists - Crée un nouvel artiste
		createArtist(w, r)
	case "PUT":
		// PUT /api/artists/{id} - Modifie un artiste
		updateArtist(w, r, path)
	case "DELETE":
		// DELETE /api/artists/{id} - Supprime un artiste
		deleteArtist(w, r, path)
	default:
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
	}
}

// getAllArtists retourne la liste de tous les artistes
func getAllArtists(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	query := "MATCH (a:Artist) RETURN a.id, a.name, a.genre, a.year ORDER BY a.id"

	result, err := neo4j.ExecuteQuery(ctx, driver, query, nil, neo4j.EagerResultTransformer)
	if err != nil {
		http.Error(w, "Erreur base de données: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var artists []Artist
	for _, record := range result.Records {
		id, _ := record.Get("a.id")
		name, _ := record.Get("a.name")
		genre, _ := record.Get("a.genre")
		year, _ := record.Get("a.year")

		artists = append(artists, Artist{
			ID:    int(id.(int64)),
			Name:  name.(string),
			Genre: genre.(string),
			Year:  int(year.(int64)),
		})
	}

	// Si vide, retourner un tableau vide plutôt que null
	if artists == nil {
		artists = []Artist{}
	}
	json.NewEncoder(w).Encode(artists)
}

// getArtistByID retourne un artiste par son ID
func getArtistByID(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := "MATCH (a:Artist {id: $id}) RETURN a.id, a.name, a.genre, a.year"
	params := map[string]any{"id": id}

	result, err := neo4j.ExecuteQuery(ctx, driver, query, params, neo4j.EagerResultTransformer)
	if err != nil {
		http.Error(w, "Erreur base de données", http.StatusInternalServerError)
		return
	}

	if len(result.Records) == 0 {
		http.Error(w, "Artiste non trouvé", http.StatusNotFound)
		return
	}

	record := result.Records[0]
	resId, _ := record.Get("a.id")
	name, _ := record.Get("a.name")
	genre, _ := record.Get("a.genre")
	year, _ := record.Get("a.year")

	artist := Artist{
		ID:    int(resId.(int64)),
		Name:  name.(string),
		Genre: genre.(string),
		Year:  int(year.(int64)),
	}

	json.NewEncoder(w).Encode(artist)
}

// createArtist crée un nouvel artiste
func createArtist(w http.ResponseWriter, r *http.Request) {
	var newArtist Artist
	if err := json.NewDecoder(r.Body).Decode(&newArtist); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	
	// Trouver le nouvel ID
	idQuery := "MATCH (a:Artist) RETURN coalesce(max(a.id), 0) + 1 as newId"
	idRes, err := neo4j.ExecuteQuery(ctx, driver, idQuery, nil, neo4j.EagerResultTransformer)
	if err != nil {
		http.Error(w, "Erreur génération ID", http.StatusInternalServerError)
		return
	}
	newID := idRes.Records[0].Values[0].(int64)
	newArtist.ID = int(newID)

	createQuery := "CREATE (a:Artist {id: $id, name: $name, genre: $genre, year: $year}) RETURN a"
	params := map[string]any{
		"id":    newArtist.ID,
		"name":  newArtist.Name,
		"genre": newArtist.Genre,
		"year":  newArtist.Year,
	}

	_, err = neo4j.ExecuteQuery(ctx, driver, createQuery, params, neo4j.EagerResultTransformer)
	if err != nil {
		http.Error(w, "Erreur création", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newArtist)
}

// updateArtist modifie un artiste existant
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

	ctx := context.Background()
	query := "MATCH (a:Artist {id: $id}) SET a.name = $name, a.genre = $genre, a.year = $year RETURN a"
	params := map[string]any{
		"id":    id,
		"name":  updatedArtist.Name,
		"genre": updatedArtist.Genre,
		"year":  updatedArtist.Year,
	}

	result, err := neo4j.ExecuteQuery(ctx, driver, query, params, neo4j.EagerResultTransformer)
	if err != nil {
		http.Error(w, "Erreur mise à jour", http.StatusInternalServerError)
		return
	}

	if len(result.Records) == 0 {
		http.Error(w, "Artiste non trouvé", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(updatedArtist)
}

// deleteArtist supprime un artiste
func deleteArtist(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	query := "MATCH (a:Artist {id: $id}) DETACH DELETE a"
	params := map[string]any{"id": id}

	_, err = neo4j.ExecuteQuery(ctx, driver, query, params, neo4j.EagerResultTransformer)
	if err != nil {
		http.Error(w, "Erreur suppression", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Artiste supprimé"})
}
