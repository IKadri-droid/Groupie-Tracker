package main

import (
	"fmt"
	"groupie/internal/core"
	"groupie/internal/features/artists"
	"groupie/internal/features/auth"
	"groupie/internal/features/payment"
	"groupie/internal/features/user"
	"log"
	"net/http"
)

func main() {
	// 1. Initialisation du coeur (DB + Env)
	if err := core.InitDB(); err != nil {
		log.Fatal("❌ Database connection failed:", err)
	}
	defer core.DB.Close()

	if err := core.RunMigrations(); err != nil {
		log.Fatal("❌ Migrations failed:", err)
	}

	// 2. Définition des routes (utilisant les features)

	// --- AUTH ---
	http.HandleFunc("/api/login", auth.HandleLogin)
	http.HandleFunc("/api/register", auth.HandleRegister)
	http.HandleFunc("/api/auth/google/login", auth.HandleGoogleLogin)
	http.HandleFunc("/api/auth/google/callback", auth.HandleGoogleCallback)

	// --- ARTISTS ---
	http.HandleFunc("/api/artists", artists.HandleArtists)
	http.HandleFunc("/api/artists/", artists.HandleArtists)

	// --- DEEZER (Indispensable pour les sons et albums) ---
	http.HandleFunc("/api/deezer/search", artists.HandleDeezerSearch)
	http.HandleFunc("/api/deezer/albums", artists.HandleDeezerAlbums)
	http.HandleFunc("/api/deezer/top-tracks", artists.HandleDeezerTopTracks)

	// --- USER ---
	http.HandleFunc("/api/profile", user.HandleGetProfile)
	http.HandleFunc("/api/history", user.GetUserHistory)
	http.HandleFunc("/api/favorites", user.HandleFavorites)

	// --- PAYMENT ---
	http.HandleFunc("/api/create-checkout-session", payment.HandleCreateCheckoutSession)
	http.HandleFunc("/api/confirm-payment", payment.HandlePaymentConfirm)

	// 3. Application des Middlewares Globaux (CORS + Rate Limiting)
	handler := core.RateLimitMiddleware(core.CORSMiddleware(http.DefaultServeMux))

	port := ":8080"
	fmt.Println("🚀 Professional REST API Server started on http://localhost" + port)
	log.Fatal(http.ListenAndServe(port, handler))
}
