# 💳 GUIDE D'INTÉGRATION - PRIX STRIPE DYNAMIQUE (Backend)

Ce guide explique comment fonctionne le calcul du prix dans le backend et comment le vérifier.

## 📌 1. Vue d'ensemble
L'objectif est d'afficher le **vrai prix** du concert sur Stripe, au lieu d'une valeur fixe (20€).

1. **Frontend** envoie : `{ concert_id: 22 }`
2. **Backend** reçoit l'ID et cherche en base de données.
3. Le backend trouve `"113.00"` pour l'ID 22.
4. **Backend -> Stripe** envoie : `{ unit_amount: 11300 }` (centimes).
5. Stripe affiche **113.00 €**.

---

## 🔍 2. Fonction Clé : `getConcertPrice`

Cette fonction (ajoutée dans `internal/api/payment.go`) est le cœur du système.

### Étapes :
1. **Query SQL :** `SELECT price FROM concerts WHERE id = ?`
2. **Scan :** Récupère la chaîne (ex: `"113,00 €"`).
3. **Nettoyage :**
   - Enlève les caractères non numériques (espaces, €, lettres).
   - Remplace `,` par `.`.
   - Resultat : `"113.00"`.
4. **Parse :** Convertit `"113.00"` en `float64` (113.0).

---

## 🛠️ 3. Mise en place (Déjà fait)

### A. Base de données
Une migration SQL (`migrations/005_update_concert_prices.sql`) a été créée pour ajouter des prix à tous les concerts.

```sql
UPDATE concerts SET price = '113.00' WHERE id = 22; -- Shakira
UPDATE concerts SET price = '45.00' WHERE id = 1; -- The Lumineers
-- etc...
```

### B. Code Go
Dans `HandleCreateCheckoutSession` (`internal/api/payment.go`) :

```go
// 1. Récupération dynamique
concertPrice, err := getConcertPrice(requestData.ConcertID)

// 2. Vérification
if err != nil || concertPrice <= 0 {
    http.Error(w, "Prix invalide", 400)
    return
}

// 3. Conversion centimes
priceInCents := int64(concertPrice * 100)

// 4. Envoi Stripe
params := &stripe.CheckoutSessionParams{
   // ...
   UnitAmount: stripe.Int64(priceInCents),
   // ...
}
```

---

## ✅ 4. Comment Tester

1. **Lancer le serveur :** `go run main.go` (ou `./server.exe`).
2. **Frontend :** Aller sur `http://localhost:3000`.
3. **Choisir un concert :** Par exemple "The Lumineers" (45€) ou "Shakira" (113€).
4. **Cliquer sur Payer.**
5. **Vérifier Stripe :** Le montant doit correspondre exactement (45.00€ vs 113.00€).

---

## ⚠️ Notes Importantes

- Si un concert n'a pas de prix en DB, la fonction renvoie une erreur (ou 0).
- Le prix est stocké en `TEXT` dans la DB, d'où la nécessité de le parser.
- Stripe attend toujours des **centimes** (entier), pas des décimaux. D'où la multiplication par 100.
