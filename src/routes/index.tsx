import { createFileRoute } from '@tanstack/react-router'
// 1. On importe notre composant personnalisé
import ArtistCard from '../components/ArtistCard'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  // 2. Les données des artistes (plus tard, ça viendra d'une API)
  const artists = [
    {
      name: "Daft Punk",
      image: "https://upload.wikimedia.org/wikipedia/commons/8/83/Daft_Punk_in_2013_2.jpg",
      genre: "Electronic",
      creationDate: 1993
    },
    {
      name: "Coldplay",
      image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/ColdplayWembley120925_%28cropped%29.jpg",
      genre: "Rock",
      creationDate: 1996
    }
  ]

  return (
    <div className="min-h-screen bg-[#282c34] text-white p-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-cyan-400 mb-4">🎵 Groupie Tracker</h1>
        <p className="text-gray-400">Découvre tes artistes préférés</p>
      </header>

      {/* 3. On affiche une carte pour CHAQUE artiste avec .map() */}
      <div className="flex flex-wrap justify-center gap-6">
        {artists.map((artist) => (
          // 4. On "passe les props" au composant ArtistCard
          <ArtistCard
            key={artist.name}  // React a besoin d'une "key" unique pour les listes
            name={artist.name}
            image={artist.image}
            genre={artist.genre}
            creationDate={artist.creationDate}
          />
        ))}
      </div>
    </div>
  )
}
