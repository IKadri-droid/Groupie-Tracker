package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var db *sql.DB

func main() {
	var err error

	// Charger les variables d'environnement depuis .env
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️ No .env file found")
	}

	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Println("⚠️ DATABASE_URL not set)")
		connStr = "postgres://user:password@localhost:5432/groupie?sslmode=disable"
	}

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("❌ Error opening database connection:", err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Println("⚠️ WARNING: Could not connect to Postgres:", err)
	} else {
		fmt.Println("✅ Connected to Postgres (Neon)")
	}

	// Initialiser la base de données (schéma + données)
	initDatabase()

	http.HandleFunc("/api/artists", handleArtists)
	http.HandleFunc("/api/artists/", handleArtists)
	http.HandleFunc("/api/login", handleLogin)
	http.HandleFunc("/api/deezer/search", handleDeezerSearch)
	http.HandleFunc("/api/deezer/albums", handleDeezerAlbums)
	http.HandleFunc("/api/deezer/top-tracks", handleDeezerTopTracks)

	port := ":8080"
	fmt.Println("🚀 REST API Server started on http://localhost" + port)
	log.Fatal(http.ListenAndServe(port, nil))
}
