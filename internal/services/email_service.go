package services

import (
	"fmt"
	"net/smtp"
	"os"
)

// SendTicketEmail envoie un mail de confirmation avec les détails du concert
func SendTicketEmail(toEmail string, location string, date string, venue string) error {
	// 1. Configuration de l'expéditeur (ton adresse mail de projet)
	from := os.Getenv("EMAIL_SENDER")
	password := os.Getenv("EMAIL_PASSWORD")
	smtpHost := "smtp.gmail.com" // Si tu utilises Gmail
	smtpPort := "587"

	// 2. Préparation du message
	subject := "Subject: Votre billet pour " + venue + " ! 🎫\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"

	// Le corps du mail en HTML
	body := fmt.Sprintf(`
		<html>
			<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
				<div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; border: 2px solid #ff4d4d;">
					<h2 style="color: #ff4d4d; text-align: center;">Groupie Tracker - Votre Billet</h2>
					<p>Bonjour ! Merci pour votre achat. Voici les détails de votre concert :</p>
					<div style="background: #fdf2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
						<p><strong>📍 Lieu :</strong> %s</p>
						<p><strong>🏟️ Salle :</strong> %s</p>
						<p><strong>📅 Date :</strong> %s</p>
					</div>
					<p style="text-align: center; font-size: 12px; color: #888;">Présentez cet email à l'entrée de la salle.</p>
				</div>
			</body>
		</html>
	`, location, venue, date)

	message := []byte(subject + mime + body)

	// 3. Authentification et Envoi
	auth := smtp.PlainAuth("", from, password, smtpHost)
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, message)

	if err != nil {
		return err
	}

	return nil
}
