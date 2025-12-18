// Un composant React, c'est une fonction qui retourne du JSX (HTML dans JS)

// 1. On définit le TYPE des données que le composant attend (TypeScript)
//    C'est comme dire "ce composant a besoin d'un nom, une image, et un genre"
interface ArtistCardProps {
    name: string
    image: string
    genre: string
    creationDate: number
}

// 2. La fonction du composant - elle reçoit les "props" (propriétés)
//    Les props sont comme des arguments passés au composant
function ArtistCard({ name, image, genre, creationDate }: ArtistCardProps) {
    // 3. On retourne du JSX - c'est comme du HTML mais dans JavaScript
    return (
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105 max-w-sm">
            {/* L'image de l'artiste */}
            <img
                src={image}
                alt={name}
                className="w-full h-48 object-cover"
            />

            {/* Les infos de l'artiste */}
            <div className="p-4">
                <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                <p className="text-white-400 text-sm mb-1">{genre}</p>
                <p className="text-gray-400 text-sm">Depuis {creationDate}</p>
            </div>
        </div>
    )
}

// 4. On exporte le composant pour pouvoir l'utiliser ailleurs
export default ArtistCard
