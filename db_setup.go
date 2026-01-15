package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
)

// initDatabase initialize la schéma et importe les données si nécessaire
func initDatabase() {
	// 1. Lire et appliquer le schéma SQL
	schema, err := os.ReadFile("tablesql.sql")
	if err != nil {
		log.Fatal("❌ Impossible de lire tablesql.sql:", err)
	}

	// db.Exec supporte plusieurs instructions avec lib/pq
	_, err = db.Exec(string(schema))
	if err != nil {
		// On continue même si erreur (ex: tables existent déjà), mais on log
		log.Println("⚠️ Avertissement lors de l'exécution du schéma (tables existent peut-être déjà):", err)
	} else {
		fmt.Println("✅ Schéma base de données appliqué.")
	}

	// 2. Vérifier si des données existent déjà
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM artists").Scan(&count)
	if err != nil {
		log.Println("⚠️ Impossible de vérifier la table artists:", err)
		return
	}

	if count > 0 {
		fmt.Println("ℹ️ La base de données contient déjà", count, "artistes. Import ignoré.")
		return
	}

	// 3. Importer les données depuis data.json
	fmt.Println("📂 Import des données initiales depuis data.json...")

	type JSONData struct {
		Artists []struct {
			ID    int    `json:"id"`
			Name  string `json:"name"`
			Genre string `json:"genre"`
			Year  int    `json:"year"`
		} `json:"artists"`
	}

	fileContent, err := os.ReadFile("data.json")
	if err != nil {
		log.Println("❌ Impossible de lire data.json:", err)
		return
	}

	var data JSONData
	if err := json.Unmarshal(fileContent, &data); err != nil {
		log.Println("❌ Erreur parsing JSON:", err)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		log.Println("❌ Erreur transaction:", err)
		return
	}

	stmt, err := tx.Prepare("INSERT INTO artists (id, name, genre, formation_year) VALUES ($1, $2, $3, $4)")
	if err != nil {
		log.Println("❌ Erreur préparation requête:", err)
		tx.Rollback()
		return
	}
	defer stmt.Close()

	for _, artist := range data.Artists {
		_, err = stmt.Exec(artist.ID, artist.Name, artist.Genre, artist.Year)
		if err != nil {
			log.Println("❌ Erreur insertion artiste:", artist.Name, err)
		}
	}

	// Mettre à jour la séquence ID pour éviter les conflits futurs
	_, _ = tx.Exec("SELECT setval('artists_id_seq', (SELECT MAX(id) FROM artists))")

	err = tx.Commit()
	if err != nil {
		log.Println("❌ Erreur commit:", err)
	} else {
		fmt.Println("✅ Import terminé avec succès !", len(data.Artists), "artistes ajoutés.")
	}
}
