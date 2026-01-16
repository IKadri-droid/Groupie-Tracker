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
