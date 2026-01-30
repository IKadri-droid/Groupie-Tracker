package api

import (
	"database/sql"
	"strconv"

	"encoding/json"
	"groupie/internal/config"
	"groupie/internal/models"
	"groupie/internal/services"
	"net/http"
	"os"
	"strings"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
)

// Helper pour récupérer le prix dynamiquement depuis la DB
func getConcertPrice(concertID int) (float64, error) {
	var priceStr sql.NullString
	query := `SELECT price FROM concerts WHERE id = $1`

	err := config.DB.QueryRow(query, concertID).Scan(&priceStr)
	if err != nil {
		return 0, err
	}
	if !priceStr.Valid {
		return 0, nil
	}

	// Nettoyage de la chaîne de caractères (ex: "113,00 €" -> "113.00")
	cleanedPrice := strings.Map(func(r rune) rune {
		if (r >= '0' && r <= '9') || r == '.' || r == ',' {
			return r
		}
		return -1
	}, priceStr.String)
	cleanedPrice = strings.ReplaceAll(cleanedPrice, ",", ".")

	if cleanedPrice == "" {
		return 0, nil
	}

	return strconv.ParseFloat(cleanedPrice, 64)
}

// HandleCreateCheckoutSession va gérer l'appel du frontend
func HandleCreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Token manquant", http.StatusUnauthorized)
		return
	}
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := services.ValidateToken(tokenString)
	if err != nil {
		http.Error(w, "Token invalide", http.StatusUnauthorized)
		return
	}

	userIDFloat, ok := claims["id"].(float64)
	if !ok {
		http.Error(w, "Utilisateur non identifié", http.StatusUnauthorized)
		return
	}
	userID := int(userIDFloat)

	var requestData struct {
		ConcertID int `json:"concert_id"`
	}
	err = json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Données JSON invalides", http.StatusBadRequest)
		return
	}

<<<<<<< HEAD
	// 3. Récupération du prix dynamique
	concertPrice, err := getConcertPrice(requestData.ConcertID)
	if err != nil || concertPrice <= 0 {
		http.Error(w, "Impossible de récupérer le prix du concert", http.StatusBadRequest)
		return
	}

	// Conversion en centimes pour Stripe (ex: 113.00 => 11300)
	priceInCents := int64(concertPrice * 100)

	// 4. Configuration de Stripe avec ta clé secrète
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// 5. On remplit le "dossier" de paiement (params)
=======
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

>>>>>>> 16887e1a2bdd53392d1f0115dac6a440212529e7
	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String("http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String("http://localhost:3000/cancel"),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String("eur"),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String("Billet de Concert"),
					},
					UnitAmount: stripe.Int64(priceInCents), // Utilisation du prix dynamique
				},
				Quantity: stripe.Int64(1),
			},
		},
	}

	s, err := session.New(params)
	if err != nil {
		http.Error(w, "Erreur Stripe: "+err.Error(), http.StatusInternalServerError)
		return
	}

<<<<<<< HEAD
	// 7. Sauvegarde en base de données
=======
>>>>>>> 16887e1a2bdd53392d1f0115dac6a440212529e7
	order := models.Order{
		UserID:          userID,
		ConcertID:       requestData.ConcertID,
		Amount:          concertPrice, // Prix dynamique
		Status:          "pending",
		StripeSessionID: s.ID,
	}

	err = models.CreateOrder(&order)
	if err != nil {
		http.Error(w, "Erreur lors de la sauvegarde de la commande", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"url": s.URL,
	})
}

// HandlePaymentConfirm est appelé quand l'utilisateur revient du paiement réussi
func HandlePaymentConfirm(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var requestData struct {
		SessionID string `json:"session_id"`
	}
	err := json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Données JSON invalides", http.StatusBadRequest)
		return
	}

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	s, err := session.Get(requestData.SessionID, nil)
	if err != nil {
		http.Error(w, "Session introuvable chez Stripe", http.StatusNotFound)
		return
	}

	if s.PaymentStatus == stripe.CheckoutSessionPaymentStatusPaid {
		// On vérifie si déjà payé pour éviter les doublons
		var currentStatus string
		err = config.DB.QueryRow("SELECT status FROM orders WHERE stripe_session_id = $1", s.ID).Scan(&currentStatus)
		if err == nil && currentStatus == "paid" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{
				"status":  "success",
				"message": "Paiement déjà confirmé.",
			})
			return
		}

		err = models.UpdateOrderStatusByStripeID(s.ID, "paid")
		if err != nil {
			http.Error(w, "Erreur lors de la mise à jour de la commande", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "success",
			"message": "Paiement confirmé et commande validée !",
		})
	} else {
		http.Error(w, "Le paiement n'a pas encore été validé", http.StatusBadRequest)
	}
}
