package services

import (
	"fmt"
	"net/smtp"
	"os"
)

func SendTicketEmail(toEmail, username, artist, location, date, venue string, amount float64, sessionID string) error {
	from := os.Getenv("EMAIL_SENDER")
	password := os.Getenv("EMAIL_PASSWORD")
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	subject := fmt.Sprintf("Subject: 🎫 Votre billet pour %s - %s\n", artist, venue)
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"

	shortID := sessionID
	if len(sessionID) > 8 {
		shortID = sessionID[len(sessionID)-8:]
	}

	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: sans-serif;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #1e293b; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); color: #ffffff;">
        <div style="background: linear-gradient(135deg, #6366f1 0%%, #a855f7 100%%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Commande Confirmée !</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Merci %s pour votre achat.</p>
        </div>
        <div style="padding: 40px;">
            <div style="margin-bottom: 30px;">
                <div style="color: #818cf8; font-size: 12px; font-weight: 800; text-transform: uppercase;">ARTISTE</div>
                <div style="color: #ffffff; font-size: 32px; font-weight: 800;">%s</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; margin-bottom: 30px;">
                <table width="100%%" border="0">
                    <tr>
                        <td><small>📍 LIEU</small><br><b>%s</b></td>
                        <td><small>🏟️ SALLE</small><br><b>%s</b></td>
                    </tr>
                    <tr>
                        <td><br><small>📅 DATE</small><br><b>%s</b></td>
                        <td><br><small>💰 PRIX</small><br><b style="color: #22c55e;">%.2f €</b></td>
                    </tr>
                </table>
            </div>
            <div style="text-align: center; background: white; padding: 20px; border-radius: 20px;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=%s" width="150">
                <p style="color: #94a3b8; font-size: 11px; margin-top: 10px;">ID TICKET: #%s</p>
            </div>
        </div>
    </div>
</body>
</html>
`, username, artist, location, venue, date, amount, sessionID, shortID)

	message := []byte(subject + mime + body)
	auth := smtp.PlainAuth("", from, password, smtpHost)
	return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, message)
}
