package payment

import (
	"database/sql"
	"encoding/json"
	"groupie/internal/core"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
)

// Helper pour récupérer le prix dynamiquement depuis la DB
func getConcertPrice(concertID int) (float64, error) {
	var priceStr sql.NullString
	query := `SELECT price FROM concerts WHERE id = $1`

	err := core.DB.QueryRow(query, concertID).Scan(&priceStr)
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

func HandleCreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := core.ValidateToken(tokenString)
	if err != nil {
		http.Error(w, "Invalide", 401)
		return
	}

	userIDFloat, ok := claims["id"].(float64)
	if !ok {
		// Fallback si float64 échoue (cas où JWT stocke int)
		userIDFloat = float64(claims["id"].(int))
	}
	userID := int(userIDFloat)

	var req struct {
		ConcertID   int `json:"concert_id"`
		Quantity    int `json:"quantity"`
		VipQuantity int `json:"vip_quantity"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}

	// 1. Récupération du prix dynamique
	concertPrice, err := getConcertPrice(req.ConcertID)
	if err != nil || concertPrice <= 0 {
		http.Error(w, "Impossible de récupérer le prix du concert", http.StatusBadRequest)
		return
	}

	// 2. Préparation des montants pour Stripe
	priceInCents := int64(concertPrice * 100)
	vipPriceInCents := int64(concertPrice * 2.5 * 100)

	// 3. Construction dynamique du panier Stripe (on n'ajoute que si quantité > 0)
	var lineItems []*stripe.CheckoutSessionLineItemParams

	if req.Quantity > 0 {
		lineItems = append(lineItems, &stripe.CheckoutSessionLineItemParams{
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency:    stripe.String("eur"),
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{Name: stripe.String("Billet Standard")},
				UnitAmount:  stripe.Int64(priceInCents),
			},
			Quantity: stripe.Int64(int64(req.Quantity)),
		})
	}

	if req.VipQuantity > 0 {
		lineItems = append(lineItems, &stripe.CheckoutSessionLineItemParams{
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency:    stripe.String("eur"),
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{Name: stripe.String("Billet VIP")},
				UnitAmount:  stripe.Int64(vipPriceInCents),
			},
			Quantity: stripe.Int64(int64(req.VipQuantity)),
		})
	}

	if len(lineItems) == 0 {
		http.Error(w, "Veuillez sélectionner au moins un billet", http.StatusBadRequest)
		return
	}

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "https://groupie-tracker-ynov.vercel.app"
	}

	params := &stripe.CheckoutSessionParams{
		SuccessURL: stripe.String(frontendURL + "/success?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String(frontendURL + "/cancel"),
		LineItems:  lineItems,
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
	}

	s, _ := session.New(params)

	// 3. Calcul du montant total réel et sauvegarde
	totalAmount := (concertPrice * float64(req.Quantity)) + (concertPrice * 2.5 * float64(req.VipQuantity))

	order := &Order{
		UserID:          userID,
		ConcertID:       req.ConcertID,
		Amount:          totalAmount,
		Status:          "pending",
		StripeSessionID: s.ID,
	}
	CreateOrder(order)

	json.NewEncoder(w).Encode(map[string]string{"url": s.URL})
}

func HandlePaymentConfirm(w http.ResponseWriter, r *http.Request) {
	var req struct {
		SessionID string `json:"session_id"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	s, _ := session.Get(req.SessionID, nil)

	if s.PaymentStatus == stripe.CheckoutSessionPaymentStatusPaid {
		affected, err := UpdateOrderStatusByStripeID(s.ID, "paid")
		if err != nil {
			log.Printf("❌ Erreur DB UpdateOrder: %v\n", err)
			http.Error(w, "Erreur mise à jour commande", http.StatusInternalServerError)
			return
		}

		if affected > 0 {
			log.Printf("✅ Commande %s payée ! Envoi email...\n", s.ID)
			dbEmail, user, artist, loc, date, venue, amount, err := GetOrderDetailsForEmail(s.ID)

			// Si Stripe nous donne un email (celui saisi au paiement), on l'utilise en priorité
			emailToSend := dbEmail
			if s.CustomerDetails != nil && s.CustomerDetails.Email != "" {
				emailToSend = s.CustomerDetails.Email
				log.Printf("ℹ️ Utilisation de l'email Stripe : %s\n", emailToSend)
			}

			if err != nil {
				log.Printf("❌ Erreur récupération détails email: %v\n", err)
			} else {
				// Lancement asynchrone mais avec log
				go func() {
					if err := SendTicketEmail(emailToSend, user, artist, loc, date, venue, amount, s.ID); err != nil {
						log.Printf("❌ ERREUR ENVOI EMAIL à %s: %v\n", emailToSend, err)
					} else {
						log.Printf("✉️ Email envoyé avec succès à %s\n", emailToSend)
					}
				}()
			}
		} else {
			log.Printf("⚠️ Commande %s déjà payée ou introuvable (affected: %d)\n", s.ID, affected)
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success"})
	}
}
