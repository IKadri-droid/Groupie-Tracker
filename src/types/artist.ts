// Types pour les artistes
// Ce fichier centralise les interfaces TypeScript pour être réutilisées partout

export interface Artist {
    id: number      // L'identifiant unique de l'artiste
    name: string    // Le nom de l'artiste
    genre: string   // Le genre musical
    year: number    // L'année de création
}
