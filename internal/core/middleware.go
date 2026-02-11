package core

import (
	"log"
	"net/http"
)

// EnableCORS est utilisé comme helper dans les handlers
func EnableCORS(w http.ResponseWriter, r *http.Request) {
	allowedOrigins := []string{
		"http://localhost:3000",
		"https://groupie-tracker-ynov.vercel.app",
	}

	origin := r.Header.Get("Origin")

	// Si l'origin est vide (requête directe), on ne met pas d'en-tête spécifique
	if origin == "" {
		return
	}

	isAllowed := false
	for _, o := range allowedOrigins {
		// Comparaison exacte pour la sécurité
		if o == origin {
			isAllowed = true
			break
		}
	}

	if isAllowed {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	} else {
		// En mode dév ou si non listé, on laisse le navigateur bloquer mais on log
		log.Printf("⚠️ Tentative d'accès CORS bloquée pour l'origine: %s\n", origin)
	}

	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
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
