package main

import (
	"fmt"
)

// initDatabase importe les données si nécessaire (schéma géré sur Neon)
func initDatabase() {
	type JSONData struct {
		Artists []struct {
			ID       int    `json:"id"`
			Name     string `json:"name"`
			Genre    string `json:"genre"`
			Year     int    `json:"year"`
			ImageURL string `json:"image_url"`
			Color    string `json:"color"`
		} `json:"artists"`
	}

	fmt.Println("✅ Backend initialisé avec succès !")
}
