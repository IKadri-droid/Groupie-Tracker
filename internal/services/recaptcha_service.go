package services

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
)

type RecaptchaResponse struct {
	Success bool    `json:"success"`
	Score   float64 `json:"score"`
	// ... autres champs si besoin
}

func VerifyRecaptcha(token string) (bool, error) {
	// 1. Récupérer la clé secrète depuis .env
	secretKey := os.Getenv("RECAPTCHA_SECRET_KEY")

	// 2. Préparer l'URL de vérification Google
	verifyURL := "https://www.google.com/recaptcha/api/siteverify"

	data := url.Values{}
	data.Set("secret", secretKey)
	data.Set("response", token)
	// 4. Envoyer la requête POST à Google
	resp, err := http.PostForm(verifyURL, data)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	// 5. Lire le corps de la réponse
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, err
	}
	// 6. Parser le JSON
	var recaptchaResp RecaptchaResponse
	err = json.Unmarshal(body, &recaptchaResp)
	if err != nil {
		return false, err
	}
	log.Printf("✅ Captcha vérifié - Success: %v, Score: %.2f", recaptchaResp.Success, recaptchaResp.Score)
	// 7. Retourner true/false
	if recaptchaResp.Success && recaptchaResp.Score > 0.6 {
		return true, nil
	}
	return false, nil
}
