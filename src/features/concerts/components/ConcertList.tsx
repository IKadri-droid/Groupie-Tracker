import { useEffect, useState } from "react";

// Types pour TypeScript (juste ce dont on a besoin)
interface Concert {
  id: string;
  name: string;
  url: string;
  dates: {
    start: { localDate: string }; // La Date
  };
  _embedded?: {
    venues?: Array<{
      name: string; // Le nom de la salle
      city: { name: string }; // La ville
    }>;
  };
}

export const ConcertList = ({ artistName }: { artistName: string }) => {
  const [concerts, setConcerts] = useState<Concert[]>([]);

  useEffect(() => {
    // On appelle TON backend (pas Ticketmaster directement)
    fetch(
      `http://localhost:8080/api/concerts?artist=${encodeURIComponent(artistName)}`
    )
      .then((res) => res.json())
      .then((data) => {
        // Ticketmaster met les résultats dans _embedded.events
        console.log("🔍 Réponse brute Ticketmaster :", data);
        if (data._embedded && data._embedded.events) {
          setConcerts(data._embedded.events);
        } else {
          setConcerts([]);
        }
      })
      .catch((err) => console.error("Erreur chargement concerts", err));
  }, [artistName]);
  // si pas de concert
  if (concerts.length === 0) {
    return (
      <div style={{ marginTop: "20px", color: "white", fontStyle: "italic" }}>
        Aucun concert prévu pour le moment.
      </div>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3 className="font-bold text-lg mb-3">📅 Prochains Concerts</h3>
      <ul className="space-y-2">
        {concerts.map((concert) => {
          // 1. Récupération de la DATE
          const date = new Date(
            concert.dates.start.localDate
          ).toLocaleDateString("fr-FR");

          // 2. Récupération du LIEU (Ville + Salle)
          // On utilise ?. pour éviter de planter si l'info manque
          const ville =
            concert._embedded?.venues?.[0]?.city?.name || "Ville inconnue";
          const salle = concert._embedded?.venues?.[0]?.name || "";

          return (
            <li
              key={concert.id}
              className="border p-3 rounded-md bg-card text-card-foreground shadow-sm"
            >
              <div className="flex justify-between items-center">
                {/* AFFICHER DATE ET LIEU */}
                <div>
                  <div className="font-semibold">
                    {date} — {ville}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    📍 {salle}
                  </div>
                </div>

                {/* Bouton vers la billetterie */}
                <a
                  href={concert.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90"
                >
                  Voir
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
