package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/api/artists", handleArtists)
	http.HandleFunc("/api/artists/", handleArtists)
	http.HandleFunc("/api/login", handleLogin)

	port := ":8080"
	fmt.Println("🚀 Serveur API REST démarré sur http://localhost" + port)
	log.Fatal(http.ListenAndServe(port, nil))
}