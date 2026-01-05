// API Layer - Fonctions pour communiquer avec le backend
// Ce fichier contient toutes les fonctions qui font des requêtes HTTP

import type { Artist } from '../types/artist'

// URL de base de l'API backend (Go sur le port 8080)
const API_BASE_URL = 'http://localhost:8080/api'

/**
 * Récupère la liste de tous les artistes depuis l'API
 * @returns Promise<Artist[]> - Un tableau d'artistes
 * @throws Error si la requête échoue
 */
export async function getArtists(): Promise<Artist[]> {
    const response = await fetch(`${API_BASE_URL}/artists`)

    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des artistes')
    }

    return response.json()
}

/**
 * Récupère un artiste par son ID
 * @param id - L'ID de l'artiste à récupérer
 * @returns Promise<Artist> - L'artiste correspondant
 */
export async function getArtistById(id: number): Promise<Artist> {
    const response = await fetch(`${API_BASE_URL}/artists/${id}`)

    if (!response.ok) {
        throw new Error(`Artiste avec l'ID ${id} non trouvé`)
    }

    return response.json()
}
