package main

import (
	"fmt"
	"log"
	"net/http"

	"groupie/internal/api"
	"groupie/internal/config"
)

func main() {
	// Initialiser la base de données
	if err := config.InitDB(); err != nil {
		log.Fatal("❌ Error initializing database:", err)
	}
	defer config.DB.Close()

	// Enregistrer les routes
	http.HandleFunc("/api/artists", api.HandleArtists)
	http.HandleFunc("/api/artists/", api.HandleArtists)
	http.HandleFunc("/api/login", api.HandleLogin)
	http.HandleFunc("/api/deezer/search", api.HandleDeezerSearch)
	http.HandleFunc("/api/deezer/albums", api.HandleDeezerAlbums)
	http.HandleFunc("/api/deezer/top-tracks", api.HandleDeezerTopTracks)
	http.HandleFunc("/api/concerts", api.HandleConcerts)

	port := ":8080"
	fmt.Println("🚀 REST API Server started on http://localhost" + port)
	log.Fatal(http.ListenAndServe(port, nil))
}
