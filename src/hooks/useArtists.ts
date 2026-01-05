// Hook personnalisé pour récupérer les artistes avec TanStack Query
// Ce hook gère automatiquement le cache, le loading et les erreurs

import { useQuery } from '@tanstack/react-query'
import { getArtists } from '../api/artists'
import type { Artist } from '../types/artist'

/**
 * Hook pour récupérer la liste des artistes
 * Utilise TanStack Query pour:
 * - Cache automatique (évite les requêtes inutiles)
 * - Gestion du loading/error
 * - Refetch automatique quand nécessaire
 */
export function useArtists() {
    return useQuery<Artist[], Error>({
        queryKey: ['artists'],     // Clé unique pour identifier cette requête dans le cache
        queryFn: getArtists,       // La fonction qui fait le fetch
        staleTime: 1000 * 60 * 5,  // Les données restent "fraîches" pendant 5 minutes
    })
}
