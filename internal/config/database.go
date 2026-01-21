package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

// DB est la connexion à la base de données partagée
var DB *sql.DB

// InitDB initialise la connexion à la base de données
func InitDB() error {
	var err error

	// Charger les variables d'environnement depuis .env
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️ No .env file found")
	}

	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Println("⚠️ DATABASE_URL not set, using default for local (might fail if not configured)")
		connStr = "postgres://user:password@localhost:5432/groupie?sslmode=disable"
	}

	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("error opening database connection: %w", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Println("⚠️ WARNING: Could not connect to Postgres:", err)
	} else {
		fmt.Println("✅ Connected to Postgres (Neon)")
	}

	return nil
}

func RunMigrations() error {
	// 1. On définit la liste de nos fichiers SQL dans l'ordre
	files := []string{
		"migrations/001_create_users_table.sql",
		"migrations/002_create_orders_table.sql",
	}

	// 2. On fait une boucle pour les exécuter un par un
	for _, file := range files {
		content, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("erreur lecture fichier %s: %w", file, err)
		}

		_, err = DB.Exec(string(content))
		if err != nil {
			return fmt.Errorf("erreur exécution migration %s: %w", file, err)
		}
		fmt.Printf("✅ Migration réussie : %s\n", file)
	}

	return nil
}
