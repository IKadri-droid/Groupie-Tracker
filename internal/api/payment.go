package api

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/stripe/stripe-go/v81"
)

// HandleCreateCheckoutSession va gérer l'appel du frontend
func HandleCreateCheckoutSession(w http.ResponseWriter, r *http.Request) {

	EnableCORS(w)
	if r.Method != http.MethodPost {
		http.Error(w, "message d'erreur", http.StatusMethodNotAllowed)
		return
	}
	// On crée une petite "boîte" (structure) pour ranger l'ID qu'on va recevoir
	var requestData struct {
		ConcertID int `json:"concert_id"`
	}

	// On dit à Go de lire le "corps" (Body) du message JSON et de le mettre dans notre boîte
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
		http.Error(w, "Données JSON invalides", http.StatusBadRequest)
		return
	}
}
