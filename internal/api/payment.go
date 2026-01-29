package api

import (
	"database/sql"
	"encoding/json"
	"groupie/internal/config"
	"groupie/internal/models"
	"groupie/internal/services"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
)

// HandleCreateCheckoutSession va gérer l'appel du frontend
func HandleCreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method == http.MethodOptions {
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

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

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
					UnitAmount: stripe.Int64(2000), // 20.00€
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

	order := models.Order{
		UserID:          userID,
		ConcertID:       requestData.ConcertID,
		Amount:          20.00,
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
	if r.Method == http.MethodOptions {
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
		// 1. On vérifie l'état actuel de la commande en base
		var currentStatus string
		q := "SELECT status FROM orders WHERE stripe_session_id = $1 LIMIT 1"
		err = config.DB.QueryRow(q, s.ID).Scan(&currentStatus)
		if err != nil && err != sql.ErrNoRows {
			log.Println("❌ Impossible de vérifier le statut de la commande :", err)
		}

		// 2. Si elle est déjà payée, on ne renvoie pas le mail
		if currentStatus == "paid" {
			log.Println("ℹ️ Commande déjà traitée pour la session :", s.ID)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{
				"status":  "success",
				"message": "Paiement déjà confirmé.",
			})
			return
		}

		// 3. On met à jour NOTRE base de données de manière atomique
		rowsAffected, err := models.UpdateOrderStatusByStripeID(s.ID, "paid")
		if err != nil {
			http.Error(w, "Erreur lors de la mise à jour de la commande", http.StatusInternalServerError)
			return
		}

		// 4. Si aucune ligne n'a été modifiée, c'est que c'est déjà fait ! (Sécurité anti-doublon)
		if rowsAffected == 0 {
			log.Println("ℹ️ Commande déjà traitée (RowsAffected=0), on n'envoie pas de second mail.")
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{
				"status":  "success",
				"message": "Paiement déjà validé.",
			})
			return
		}

		// 5. On récupère les infos étendues pour le mail
		email, user, artist, loc, date, venue, amount, err := models.GetOrderDetailsForEmail(s.ID)
		if err != nil {
			log.Println("❌ Erreur récupération détails :", err)
		} else {
			log.Println("📧 Envoi du mail complet à :", email)
			go func() {
				// 5. On lance l'envoi
				if err := services.SendTicketEmail(email, user, artist, loc, date, venue, amount, s.ID); err != nil {
					log.Println("❌ Erreur SMTP :", err)
				} else {
					log.Println("✅ Mail envoyé avec succès !")
				}
			}()
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
