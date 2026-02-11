package core

import (
	"log"
	"net/http"
	"strings"
)

// EnableCORS est utilisé comme helper dans les handlers
func EnableCORS(w http.ResponseWriter, r *http.Request) {
	allowedOrigins := []string{
		"http://localhost:3000",
		"https://groupie-tracker-ynov.vercel.app",
	}

	origin := r.Header.Get("Origin")

	// Si l'origin est vide (requête directe ou Postman), on autorise
	if origin == "" {
		return
	}

	// Normalisation pour éviter les erreurs de slash final
	originTrimmed := strings.TrimRight(origin, "/")

	isAllowed := false
	for _, o := range allowedOrigins {
		if strings.EqualFold(o, originTrimmed) {
			isAllowed = true
			break
		}
	}

	if isAllowed {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
	} else {
		// Log pour débugger les problèmes de CORS en prod
		log.Printf("⚠️ CORS bloqué pour l'origine: [%s]. Attendus: %v", origin, allowedOrigins)
		// On ne met pas de header si pas autorisé, le navigateur bloquera de lui-même
	}
}

// CORSMiddleware est utilisé comme wrapper global dans main.go
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		EnableCORS(w, r)
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
