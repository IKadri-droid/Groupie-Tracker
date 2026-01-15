import { createFileRoute } from '@tanstack/react-router'
import { useArtists } from '../hooks/useArtists'
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  // Utilisation du hook personnalisé
  // Il gère automatiquement le loading, l'erreur et le cache
  const { data: artists = [], isLoading, error } = useArtists()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="width-full">
          <img src="/logo.png" alt="logo" className="pt-70 pb-70  " />
        </div>
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
            🎸 Artistes
          </h1>
        </div>

        {/* Affichage de l'erreur */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 text-center mb-8">
            <p className="text-red-400">{error.message}</p>
          </div>
        )}

        {/* Spinner de chargement */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Grille des artistes */}
        {!isLoading && !error && (
<<<<<<< Updated upstream
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <Card
                key={artist.id}
                className="bg-slate-800/60 backdrop-blur border-slate-700 hover:border-pink-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-pink-500/10"
              >
                <div className="text-4xl mb-4">🎵</div>
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
=======
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="group relative h-96 overflow-hidden rounded-2xl cursor-pointer shadow-2xl transition-all hover:-translate-y-2"
              >
                {/* Image de fond */}
                <div className="absolute inset-0">
                  {artist.image_url ? (
                    <img
                      src={artist.image_url}
                      alt={artist.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-800 flex items-center justify-center">
                      <span className="text-6xl">🎵</span>
                    </div>
                  )}
                  {/* Overlay dégradé */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                </div>

                {/* Contenu */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
                    {artist.name}
                  </h2>
                  <div className="space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <p className="text-pink-400 font-medium tracking-wide uppercase text-sm">
                      {artist.genre}
                    </p>
                    <p className="text-slate-300 text-sm">
                      Formé en {artist.year}
                    </p>
                  </div>
>>>>>>> Stashed changes
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message si aucun artiste */}
        {!isLoading && !error && artists.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-2xl mb-2">📭</p>
            <p>Aucun artiste trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
