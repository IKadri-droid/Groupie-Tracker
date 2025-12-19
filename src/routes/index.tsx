import { createFileRoute } from '@tanstack/react-router'
import ArtistCard from '../components/ArtistCard'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: App,
})


// ============================================
// DÉFINITION DU TYPE TYPESCRIPT
// ============================================
// On définit la structure d'un artiste pour que TypeScript
// sache exactement quelles propriétés on attend dans le JSON
interface Artist {
  id: number      // L'identifiant unique de l'artiste
  name: string    // Le nom de l'artiste
  genre: string   // Le genre musical
  year: number    // L'année de création
}

// ============================================
// URL DE L'API
// ============================================
// C'est l'adresse où notre backend Go écoute
// Le backend tourne sur le port 8080
// L'endpoint /api/artists retourne la liste des artistes en JSON
const API_URL = 'http://localhost:8080/api/artists'

function App() {
  // ============================================
  // LES ÉTATS (useState)
  // ============================================
  // useState permet de stocker des données qui peuvent changer
  // Quand ces données changent, React re-affiche le composant

  // artists : tableau pour stocker les artistes récupérés depuis l'API
  // setArtists : fonction pour modifier ce tableau
  const [artists, setArtists] = useState<Artist[]>([])

  // loading : booléen pour savoir si on est en train de charger les données
  const [loading, setLoading] = useState(true)

  // error : message d'erreur si la requête échoue
  const [error, setError] = useState<string | null>(null)

  // ============================================
  // useEffect - EXÉCUTION AU CHARGEMENT
  // ============================================
  // useEffect permet d'exécuter du code quand le composant se charge
  // Le tableau vide [] signifie : "exécute ça une seule fois au démarrage"
  useEffect(() => {
    fetchArtists() // On appelle la fonction qui récupère les artistes
  }, [])

  // ============================================
  // FONCTION FETCH - RÉCUPÉRATION DES DONNÉES
  // ============================================
  // Cette fonction fait une requête HTTP GET vers notre API
  const fetchArtists = async () => {
    // 1. On indique qu'on est en train de charger
    setLoading(true)
    setError(null)

    try {
      // 2. fetch() envoie une requête HTTP GET vers l'URL de l'API
      //    C'est une fonction native de JavaScript pour faire des requêtes réseau
      //    Par défaut, fetch fait une requête GET
      const response = await fetch(API_URL)

      // 3. response.json() convertit la réponse en objet JavaScript
      //    Le serveur nous renvoie du JSON (texte), et .json() le parse
      //    pour qu'on puisse l'utiliser comme un tableau d'objets
      const data = await response.json()

      // 4. On stocke les données dans notre état
      //    React va automatiquement re-afficher le composant avec les nouvelles données
      setArtists(data)

    } catch (err) {
      // 5. Si une erreur se produit (serveur pas démarré, erreur réseau, etc.)
      //    on stocke le message d'erreur pour l'afficher
      setError('Erreur de connexion au serveur. Vérifiez que le backend Go tourne sur le port 8080.')
    }

    // 6. Dans tous les cas, on indique qu'on a fini de charger
    setLoading(false)
  }

  // ============================================
  // RENDU JSX - AFFICHAGE
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête avec titre et URL de l'API */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
            🎸 Artistes
          </h1>
        </header>

        {/* Affichage conditionnel de l'erreur */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 text-center mb-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Spinner de chargement */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* ============================================
            AFFICHAGE DES CARTES
            ============================================
            On utilise .map() pour transformer chaque artiste en carte
            .map() parcourt le tableau et crée un élément pour chaque item */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              // Chaque carte a une "key" unique (l'ID de l'artiste)
              // React utilise cette key pour optimiser le rendu
              <div
                key={artist.id}
                className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700 hover:border-pink-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-pink-500/10"
              >
                <div className="text-4xl mb-4">🎵</div>
                {/* On accède aux propriétés de l'objet artist avec la notation point */}
                <h2 className="text-xl font-bold mb-2">{artist.name}</h2>
                <div className="space-y-1 text-sm text-slate-400">
                  <p>
                    <span className="text-slate-500">Genre:</span>{' '}
                    <span className="text-white">{artist.genre}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Année:</span>{' '}
                    <span className="text-white">{artist.year}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">ID:</span>{' '}
                    <span className="text-pink-400">{artist.id}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message si aucun artiste n'est trouvé */}
        {!loading && !error && artists.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-2xl mb-2">📭</p>
            <p>Aucun artiste trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
