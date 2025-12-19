package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
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

// Data représente la structure du fichier JSON
type Data struct {
	Artists []Artist `json:"artists"`
}

var dataFile = "data.json"

// loadData charge les données depuis le fichier JSON
func loadData() (Data, error) {
	var data Data
	file, err := os.ReadFile(dataFile)
	if err != nil {
		return data, err
	}
	err = json.Unmarshal(file, &data)
	return data, err
}

// saveData sauvegarde les données dans le fichier JSON
func saveData(data Data) error {
	file, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(dataFile, file, 0644)
}

// enableCORS ajoute les headers CORS pour permettre les requêtes du frontend
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
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
	data, err := loadData()
	if err != nil {
		http.Error(w, "Erreur lecture données", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(data.Artists)
}

// getArtistByID retourne un artiste par son ID
func getArtistByID(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	data, err := loadData()
	if err != nil {
		http.Error(w, "Erreur lecture données", http.StatusInternalServerError)
		return
	}

	for _, artist := range data.Artists {
		if artist.ID == id {
			json.NewEncoder(w).Encode(artist)
			return
		}
	}
	http.Error(w, "Artiste non trouvé", http.StatusNotFound)
}

// createArtist crée un nouvel artiste
func createArtist(w http.ResponseWriter, r *http.Request) {
	var newArtist Artist
	if err := json.NewDecoder(r.Body).Decode(&newArtist); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	data, err := loadData()
	if err != nil {
		http.Error(w, "Erreur lecture données", http.StatusInternalServerError)
		return
	}

	// Générer un nouvel ID (max ID + 1)
	maxID := 0
	for _, artist := range data.Artists {
		if artist.ID > maxID {
			maxID = artist.ID
		}
	}
	newArtist.ID = maxID + 1

	data.Artists = append(data.Artists, newArtist)

	if err := saveData(data); err != nil {
		http.Error(w, "Erreur sauvegarde", http.StatusInternalServerError)
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

	data, err := loadData()
	if err != nil {
		http.Error(w, "Erreur lecture données", http.StatusInternalServerError)
		return
	}

	for i, artist := range data.Artists {
		if artist.ID == id {
			updatedArtist.ID = id
			data.Artists[i] = updatedArtist
			if err := saveData(data); err != nil {
				http.Error(w, "Erreur sauvegarde", http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode(updatedArtist)
			return
		}
	}
	http.Error(w, "Artiste non trouvé", http.StatusNotFound)
}

// deleteArtist supprime un artiste
func deleteArtist(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID invalide", http.StatusBadRequest)
		return
	}

	data, err := loadData()
	if err != nil {
		http.Error(w, "Erreur lecture données", http.StatusInternalServerError)
		return
	}

	for i, artist := range data.Artists {
		if artist.ID == id {
			// Supprimer l'artiste du slice
			data.Artists = append(data.Artists[:i], data.Artists[i+1:]...)
			if err := saveData(data); err != nil {
				http.Error(w, "Erreur sauvegarde", http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"message": "Artiste supprimé"})
			return
		}
	}
	http.Error(w, "Artiste non trouvé", http.StatusNotFound)
}

func main() {
	// Route principale pour l'API
	http.HandleFunc("/api/artists", handleArtists)
	http.HandleFunc("/api/artists/", handleArtists)

	port := ":8080"
	fmt.Println("🚀 Serveur API REST démarré sur http://localhost" + port)
	fmt.Println("📍 Endpoints disponibles:")
	fmt.Println("   GET    /api/artists      - Liste tous les artistes")
	fmt.Println("   GET    /api/artists/{id} - Récupère un artiste")
	fmt.Println("   POST   /api/artists      - Crée un artiste")
	fmt.Println("   PUT    /api/artists/{id} - Modifie un artiste")
	fmt.Println("   DELETE /api/artists/{id} - Supprime un artiste")

	log.Fatal(http.ListenAndServe(port, nil))
}
