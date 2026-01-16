// Types pour les artistes
// Ce fichier centralise les interfaces TypeScript pour être réutilisées partout

export interface Artist {
    id: number      // L'identifiant unique de l'artiste
    name: string    // Le nom de l'artiste
    genre: string   // Le genre musical
    year: number    // L'année de création
    image_url?: string // L'URL de l'image de l'artiste
    color?: string     // La couleur dominante de l'artiste
    next_concert?: string // Le prochain concert de l'artiste   
}
