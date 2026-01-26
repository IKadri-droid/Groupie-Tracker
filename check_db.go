package main

import (
	"fmt"
	"groupie/internal/config"
	"log"
)

func main() {
	config.LoadEnv()
	if err := config.InitDB(); err != nil {
		log.Fatal(err)
	}
	defer config.DB.Close()

	fmt.Println("--- Artists ---")
	rows, _ := config.DB.Query("SELECT id, name FROM artists")
	for rows.Next() {
		var id int
		var name string
		rows.Scan(&id, &name)
		fmt.Printf("ID: %d, Name: %s\n", id, name)
	}
	rows.Close()

	fmt.Println("\n--- Concerts ---")
	rows, _ = config.DB.Query("SELECT id, artist_id, location FROM concerts")
	for rows.Next() {
		var id, artistID int
		var location string
		rows.Scan(&id, &artistID, &location)
		fmt.Printf("ID: %d, ArtistID: %d, Location: %s\n", id, artistID, location)
	}
	rows.Close()
}
