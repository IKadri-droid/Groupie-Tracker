package main

import (
	"encoding/json"
	"net/http"
	"os"
)

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
