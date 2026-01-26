package api

import (
	"database/sql"
	"encoding/json"
	"groupie/internal/config"
	"groupie/internal/models"
	"groupie/internal/services"
	"net/http"
	"os"
	"strings"

	"strconv"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
)

// HandleCreateCheckoutSession va gérer l'appel du frontend
func HandleCreateCheckoutSession(w http.ResponseWriter, r *http.Request) {
	// 1. Autorisation et Sécurité
	EnableCORS(w)
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

	// 3. On récupère les infos du concert et de l'artiste depuis la DB
	var artistName, artistImage, priceStr, location, date, venue string
	err = config.DB.QueryRow(`
		SELECT a.name, a.image_url, c.price, c.location, c.date, c.venue
		FROM concerts c
		JOIN artists a ON c.artist_id = a.id
		WHERE c.id = $1`, requestData.ConcertID).Scan(&artistName, &artistImage, &priceStr, &location, &date, &venue)
	if err != nil {
		http.Error(w, "Concert ou artiste introuvable", http.StatusNotFound)
		return
	}

	// Conversion du prix de string vers float64 (ex: "20.00" -> 20.00)
	price, _ := strconv.ParseFloat(priceStr, 64)
	if price == 0 {
		price = 20.00 // fallback
	}
	unitAmount := int64(price * 100)

	// 4. Configuration de Stripe avec ta clé secrète
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// 5. On remplit le "dossier" de paiement (params)
	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{
			"card",
		}),
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String("http://localhost:8080/success?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String("http://localhost:8080/cancel"),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String("eur"),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name:   stripe.String("Billet: " + artistName),
						Images: stripe.StringSlice([]string{artistImage}),
					},
					UnitAmount: stripe.Int64(unitAmount),
				},
				Quantity: stripe.Int64(1),
			},
		},
	}

	// 6. ACTION : On envoie le dossier à Stripe
	s, err := session.New(params)
	if err != nil {
		http.Error(w, "Erreur Stripe: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 7. Sauvegarde en base de données
	order := models.Order{
		UserID:          userID,
		ConcertID:       requestData.ConcertID,
		Amount:          price,
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

	// 1. On configure Stripe
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// 2. On demande à Stripe les détails de cette session
	s, err := session.Get(requestData.SessionID, nil)
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

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "success",
			"message": "Paiement confirmé et commande validée !",
		})
	} else {
		http.Error(w, "Le paiement n'a pas encore été validé", http.StatusBadRequest)
	}
}

func RetakeImage(w http.ResponseWriter, r *http.Request) {
	rows, err := config.DB.Query("SELECT id, name, genre, date_last_album, image_url, color FROM artists ORDER BY id")
	if err != nil {
		http.Error(w, "Erreur base de données: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var artists []models.Artist
	for rows.Next() {
		var a models.Artist
		var imageURL sql.NullString
		var color sql.NullString
		if err := rows.Scan(&a.ID, &a.Name, &a.Genre, &a.Year, &imageURL, &color); err != nil {
			continue
		}
		if imageURL.Valid {
			a.ImageURL = imageURL.String
		}
		if color.Valid {
			a.Color = color.String
		}

		// Récupérer les concerts pour cet artiste
		concerts, err := getConcertsByArtistID(a.ID)
		if err == nil {
			a.Concerts = concerts
		} else {
			// On ne bloque pas si erreur de récupération des concerts, on init à vide
			a.Concerts = []models.Concert{}
		}

		artists = append(artists, a)
	}

	if artists == nil {
		artists = []models.Artist{}
	}
	json.NewEncoder(w).Encode(artists)
}

// HandleGetPaymentSummary récupère les infos de l'artiste et du concert avant le paiement
func HandleGetPaymentSummary(w http.ResponseWriter, r *http.Request) {
	EnableCORS(w)
	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	concertIDStr := r.URL.Query().Get("concert_id")
	if concertIDStr == "" {
		http.Error(w, "ID de concert manquant", http.StatusBadRequest)
		return
	}

	concertID, err := strconv.Atoi(concertIDStr)
	if err != nil {
		http.Error(w, "ID de concert invalide", http.StatusBadRequest)
		return
	}

	var summary models.PaymentSummaryResponse
	var priceStr string
	query := `
		SELECT a.name, a.image_url, c.location, c.date, c.venue, c.price, c.id
		FROM concerts c
		JOIN artists a ON c.artist_id = a.id
		WHERE c.id = $1`

	err = config.DB.QueryRow(query, concertID).Scan(
		&summary.ArtistName, &summary.ArtistImage, &summary.Location,
		&summary.Date, &summary.Venue, &priceStr, &summary.ConcertID,
	)

	if err != nil {
		http.Error(w, "Concert ou artiste introuvable", http.StatusNotFound)
		return
	}

	// Conversion du prix
	summary.Price, _ = strconv.ParseFloat(priceStr, 64)
	if summary.Price == 0 {
		summary.Price = 20.00 // fallback
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}
