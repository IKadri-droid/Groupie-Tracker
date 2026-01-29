package api

import (
	"encoding/json"
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
	// 1. Autorisation et Sécurité
	EnableCORS(w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Extraction du token JWT
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

	// On récupère l'ID utilisateur (attention, le type peut être float64 après JSON decoding du JWT)
	userIDFloat, ok := claims["id"].(float64)
	if !ok {
		http.Error(w, "Utilisateur non identifié", http.StatusUnauthorized)
		return
	}
	userID := int(userIDFloat)

	// 2. Lecture des données envoyées par le front
	var requestData struct {
		ConcertID int `json:"concert_id"`
	}
	err = json.NewDecoder(r.Body).Decode(&requestData)
	if err != nil {
		http.Error(w, "Données JSON invalides", http.StatusBadRequest)
		return
	}

	// 3. Configuration de Stripe avec ta clé secrète
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// 4. On remplit le "dossier" de paiement (params)
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

	// 5. ACTION : On envoie le dossier à Stripe
	s, err := session.New(params)
	if err != nil {
		http.Error(w, "Erreur Stripe: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 6. Sauvegarde en base de données
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

	// 7. RÉPONSE : On renvoie l'URL de paiement au frontend
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
	var sessionID string
	// Si c'est un POST (depuis le front), on lit le JSON
	if r.Method == http.MethodPost {
		var requestData struct {
			SessionID string `json:"session_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&requestData); err == nil {
			sessionID = requestData.SessionID
		}
	} else {
		// Si c'est un GET (depuis ton navigateur), on lit l'URL
		sessionID = r.URL.Query().Get("session_id")
	}
	if sessionID == "" {
		http.Error(w, "ID de session manquant", http.StatusBadRequest)
		return
	}
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// 2. On demande à Stripe les détails de cette session
	s, err := session.Get(sessionID, nil)
	if err != nil {
		http.Error(w, "Session introuvable chez Stripe", http.StatusNotFound)
		return
	}

	// 3. Si le paiement est bien confirmé
	if s.PaymentStatus == stripe.CheckoutSessionPaymentStatusPaid {
		// On met à jour NOTRE base de données
		err = models.UpdateOrderStatusByStripeID(s.ID, "paid")
		if err != nil {
			http.Error(w, "Erreur lors de la mise à jour de la commande", http.StatusInternalServerError)
			return
		}

		email, loc, date, venue, err := models.GetOrderDetailsForEmail(s.ID)
		if err != nil {
			log.Println("❌ Erreur base de données :", err)
		} else {
			log.Println("📧 Tentative d'envoi d'email à :", email)
			go func() {
				if err := services.SendTicketEmail(email, loc, date, venue); err != nil {
					log.Println("❌ Erreur SMTP :", err)
				} else {
					log.Println("✅ Email envoyé avec succès !")
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
