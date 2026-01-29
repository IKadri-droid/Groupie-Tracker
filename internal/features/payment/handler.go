package payment

import (
	"encoding/json"
	"groupie/internal/core"
	"net/http"
	"os"
	"strings"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
)

func HandleCreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := core.ValidateToken(tokenString)
	if err != nil {
		http.Error(w, "Invalide", 401)
		return
	}

	userID := int(claims["id"].(float64))
	var req struct {
		ConcertID int `json:"concert_id"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	params := &stripe.CheckoutSessionParams{
		SuccessURL: stripe.String("http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String("http://localhost:3000/cancel"),
		LineItems: []*stripe.CheckoutSessionLineItemParams{{
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency:    stripe.String("eur"),
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{Name: stripe.String("Billet")},
				UnitAmount:  stripe.Int64(2000),
			},
			Quantity: stripe.Int64(1),
		}},
		Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
	}

	s, _ := session.New(params)
	CreateOrder(&Order{UserID: userID, ConcertID: req.ConcertID, Amount: 20, Status: "pending", StripeSessionID: s.ID})
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
		affected, _ := UpdateOrderStatusByStripeID(s.ID, "paid")
		if affected > 0 {
			email, user, artist, loc, date, venue, amount, _ := GetOrderDetailsForEmail(s.ID)
			go SendTicketEmail(email, user, artist, loc, date, venue, amount, s.ID)
		}
		json.NewEncoder(w).Encode(map[string]string{"status": "success"})
	}
}
