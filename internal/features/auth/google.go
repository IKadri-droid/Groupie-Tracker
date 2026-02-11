package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"groupie/internal/core"
	"log"
	"net/http"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var googleOauthConfig *oauth2.Config

func InitGoogleOAuth() {
	googleOauthConfig = &oauth2.Config{
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}
}

func HandleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	if googleOauthConfig == nil {
		InitGoogleOAuth()
	}
	url := googleOauthConfig.AuthCodeURL("state-token")
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func HandleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	if googleOauthConfig == nil {
		InitGoogleOAuth()
	}

	state := r.FormValue("state")
	if state != "state-token" {
		log.Println("Invalid oauth state")
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	code := r.FormValue("code")
	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		fmt.Printf("Code exchange failed: %s\n", err.Error())
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		fmt.Printf("Failed getting user info: %s\n", err.Error())
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}
	defer response.Body.Close()

	var googleUser struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(response.Body).Decode(&googleUser); err != nil {
		fmt.Printf("Failed decoding user info: %s\n", err.Error())
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	// Chercher ou créer l'utilisateur
	user, err := GetUserByEmail(googleUser.Email)
	if err != nil {
		// L'utilisateur n'existe pas, on le crée
		user = &User{
			Email:    googleUser.Email,
			Username: googleUser.Name,
			Role:     "user",
		}
		// On pourrait aussi ajouter google_id ici
		if err := CreateGoogleUser(user, googleUser.ID); err != nil {
			log.Println("Error creating google user:", err)
			http.Error(w, "Error creating user", http.StatusInternalServerError)
			return
		}
		// Récupérer l'utilisateur créé pour avoir son ID
		user, _ = GetUserByEmail(googleUser.Email)
	}

	// Générer le token JWT
	jwtToken, err := core.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	// Rediriger vers le frontend avec le token (ou via un cookie)
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	http.Redirect(w, r, frontendURL+"/login?token="+jwtToken, http.StatusTemporaryRedirect)
}
