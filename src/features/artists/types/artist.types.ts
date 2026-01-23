// Types pour les artistes
// Ce fichier centralise les interfaces TypeScript pour être réutilisées partout

export interface Artist {
    id: number      // L'identifiant unique de l'artiste
    name: string    // Le nom de l'artiste
    genre: string   // Le genre musical
    year: number    // L'année de création
    image_url?: string // L'URL de l'image de l'artiste
    color?: string     // La couleur dominante de l'artiste 
    concerts?: Concert[] // La liste des concerts de l'artiste
}

export interface Concert {
  id: number;
  location: string;
  date: string;
  latitude: number;
  longitude: number;
  time: string;
  venue: string;
  price: string;
  available_seats: number;
  ticket_url: string;
}