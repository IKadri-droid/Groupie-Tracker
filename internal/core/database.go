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
		connStr = "postgres://user:password@localhost:5432/groupie?sslmode=disable"
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
	files := []string{
		"migrations/001_create_users_table.sql",
		"migrations/002_create_orders_table.sql",
		"migrations/003_add_concert_details.sql",
		"migrations/004_create_favorites_table.sql",
	}

	for _, file := range files {
		content, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("read error %s: %w", file, err)
		}
		if _, err = DB.Exec(string(content)); err != nil {
			return fmt.Errorf("migration error %s: %w", file, err)
		}
		fmt.Printf("✅ Migration: %s\n", file)
	}
	return nil
}
