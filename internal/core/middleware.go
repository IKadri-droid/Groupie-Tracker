package core

import "net/http"

// EnableCORS est utilisé comme helper dans les handlers
func EnableCORS(w http.ResponseWriter, r *http.Request) {
	allowedOrigins := []string{
		"http://localhost:3000",
		"https://groupie-tracker-ynov.vercel.app",
	}

	origin := r.Header.Get("Origin")
	isAllowed := false

	for _, o := range allowedOrigins {
		if o == origin {
			isAllowed = true
			break
		}
	}

	if isAllowed {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	} else {
		// Par défaut, on peut laisser localhost pour le dev ou ne rien mettre
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
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
