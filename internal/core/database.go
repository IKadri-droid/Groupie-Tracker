package core

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() error {
	var err error
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️ No .env file found")
	}

	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Println("⚠️ DATABASE_URL not set, using default")
		connStr = "postgres://user:password@db:5432/groupie?sslmode=disable"
	}

	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("error opening database: %w", err)
	}

	if err = DB.Ping(); err != nil {
		log.Println("⚠️ WARNING: DB connection failed:", err)
	} else {
		fmt.Println("✅ DB Connected (Core)")
	}
	return nil
}

func RunMigrations() error {
	entries, err := os.ReadDir("migrations")
	if err != nil {
		return fmt.Errorf("error reading migrations directory: %w", err)
	}

	for _, entry := range entries {
		name := entry.Name()
		if entry.IsDir() || len(name) < 4 || name[len(name)-4:] != ".sql" {
			continue
		}

		filePath := fmt.Sprintf("migrations/%s", name)
		content, err := os.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("read error %s: %w", filePath, err)
		}

		if _, err = DB.Exec(string(content)); err != nil {
			log.Printf("⚠️ Migration warning/error in %s: %v", filePath, err)
		} else {
			fmt.Printf("✅ Migration: %s\n", filePath)
		}
	}
	return nil
}
