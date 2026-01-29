package main

import (
	"fmt"
	"groupie/internal/api"
	"groupie/internal/config"
	"log"
	"net/http"
)

func main() {
	config.LoadEnv()
	if err := config.InitDB(); err != nil {
		log.Fatal("❌ Error initializing database:", err)
	}
	defer config.DB.Close()

	if err := config.RunMigrations(); err != nil {
		log.Fatal("Error Migrations", err)
	}

	http.HandleFunc("/api/artists", api.HandleArtists)
	http.HandleFunc("/api/artists/", api.HandleArtists)
	http.HandleFunc("/api/login", api.HandleLogin)
	http.HandleFunc("/api/deezer/search", api.HandleDeezerSearch)
	http.HandleFunc("/api/deezer/albums", api.HandleDeezerAlbums)
	http.HandleFunc("/api/deezer/top-tracks", api.HandleDeezerTopTracks)
	http.HandleFunc("/api/register", api.HandleRegister)
	http.HandleFunc("/api/create-checkout-session", api.HandleCreateCheckoutSession)
	http.HandleFunc("/api/history", api.GetUserHistory)
	http.HandleFunc("/api/profile", api.HandleGetProfile)
	http.HandleFunc("/api/concerts", api.HandleConcerts)
	http.HandleFunc("/api/confirm-payment", api.HandlePaymentConfirm)
	http.HandleFunc("/api/favorites", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet || r.Method == "OPTIONS" {
			api.HandleGetFavorites(w, r)
		} else if r.Method == http.MethodPost {
			api.HandleAddFavorite(w, r)
		} else {
			http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	})

	port := ":8080"
	fmt.Println("🚀 REST API Server started on http://localhost" + port)
	log.Fatal(http.ListenAndServe(port, nil))
}
