// API Layer - Fonctions pour communiquer avec le backend
// Ce fichier contient toutes les fonctions qui font des requêtes HTTP

import type { Artist } from '../types/artist.types'

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

/**
 * Crée un nouvel artiste
 * @param artist - Les données de l'artiste à créer (sans l'id)
 * @returns Promise<Artist> - L'artiste créé avec son id
 */
export async function createArtist(artist: Omit<Artist, 'id'>): Promise<Artist> {   
    /*Omit<Artist, 'id'> c'est Le type Artist mais sans le champ id (car il sera généré par le backend)*/
    const response = await fetch(`${API_BASE_URL}/artists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(artist),
    })
    if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'artiste')
    }
    return response.json()
}


export async function deleteArtist(id:number){
     const response = await fetch(`${API_BASE_URL}/artists/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    return response.json()
}