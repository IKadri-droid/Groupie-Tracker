package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
    "os"
)

var driver neo4j.DriverWithContext

func main() {
	var err error
	ctx := context.Background()
	driver, err = connectNeo4j()
	if err != nil {
		log.Fatal("❌ Erreur de connexion Neo4j:", err)
	}
	defer driver.Close(ctx)

	// Vérifier la connexion
	err = driver.VerifyConnectivity(ctx)
	if err != nil {
		log.Fatal("❌ Impossible de joindre Neo4j:", err)
	}
	fmt.Println("✅ Connecté à Neo4j")

	http.HandleFunc("/api/artists", handleArtists)
	http.HandleFunc("/api/artists/", handleArtists)
	http.HandleFunc("/api/login", handleLogin)

	port := ":8080"
	fmt.Println("🚀 Serveur API REST démarré sur http://localhost" + port)
	log.Fatal(http.ListenAndServe(port, nil))
}

func connectNeo4j() (neo4j.DriverWithContext, error) {
    uri := os.Getenv("NEO4J_URI") // Récupéré du docker-compose
    user := os.Getenv("NEO4J_USER")
    pass := os.Getenv("NEO4J_PASS")

    driver, err := neo4j.NewDriverWithContext(uri, neo4j.BasicAuth(user, pass, ""))
    return driver, err
}