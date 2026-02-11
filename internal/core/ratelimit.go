package core

import (
	"fmt"
	"net"
	"net/http"
	"sync"
	"time"
)

// Info de suivi pour chaque client (IP)
type client struct {
	attempts     int
	windowStart  time.Time
	blockedUntil time.Time
}

var (
	clients = make(map[string]*client)
	mu      sync.Mutex
)

func init() {
	// Nettoyage périodique de la mémoire pour supprimer les IP qui ne sont plus actives
	go func() {
		for {
			time.Sleep(30 * time.Minute)
			mu.Lock()
			for ip, c := range clients {
				if time.Now().After(c.blockedUntil) && time.Since(c.windowStart) > time.Hour {
					delete(clients, ip)
				}
			}
			mu.Unlock()
		}
	}()
}

// RateLimitMiddleware limite à 5 requêtes par minute, bloque 10 minutes en cas d'abus.
func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Extraction de l'IP du client
		ip, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			ip = r.RemoteAddr
		}

		// Support des Proxy (Azure / Vercel / Cloudflare)
		if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
			// On prend la première IP si plusieurs sont présentes
			ip = (forwarded)
		}

		mu.Lock()
		c, exists := clients[ip]
		if !exists {
			c = &client{attempts: 0, windowStart: time.Now()}
			clients[ip] = c
		}

		// 1. Vérifier si l'IP est actuellement bannie
		if time.Now().Before(c.blockedUntil) {
			remaining := time.Until(c.blockedUntil).Round(time.Second)
			mu.Unlock()

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			fmt.Fprintf(w, `{"error": "Sécurité : Trop de requêtes. IP bloquée pour encore %v"}`, remaining)
			return
		}

		// 2. Vérifier si on doit réinitialiser la fenêtre de 1 minute
		if time.Since(c.windowStart) > time.Minute {
			c.attempts = 0
			c.windowStart = time.Now()
		}

		// 3. Incrémenter et vérifier le seuil (5 requêtes max)
		c.attempts++
		if c.attempts > 5 {
			c.blockedUntil = time.Now().Add(10 * time.Minute)
			mu.Unlock()

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			fmt.Fprintf(w, `{"error": "Sécurité : Limite de 5 requêtes/min dépassée. IP bannie pour 10 minutes."}`)
			return
		}
		mu.Unlock()

		next.ServeHTTP(w, r)
	})
}
