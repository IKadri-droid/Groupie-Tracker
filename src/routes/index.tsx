import { createFileRoute } from "@tanstack/react-router";
import { useArtists, ArtistDialog, type Artist } from "@/features/artists";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { data: artists = [], isLoading, error } = useArtists();
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [fadingOutColor, setFadingOutColor] = useState<string | null>(null);
  const [fadeKey, setFadeKey] = useState(0);
  const lastColorRef = useRef<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  // Gérer les transitions de couleur
  useEffect(() => {
    // Si on a une nouvelle couleur
    if (currentColor && currentColor !== lastColorRef.current) {
      // Garder l'ancienne couleur pour le fade-out
      if (lastColorRef.current) {
        setFadingOutColor(lastColorRef.current);
      }
      setFadeKey((k) => k + 1);
      lastColorRef.current = currentColor;

      // Clear fading out color after animation
      const timer = setTimeout(() => setFadingOutColor(null), 1000);
      return () => clearTimeout(timer);
    }

    // Si on quitte une couleur (retour au fond de base)
    if (!currentColor && lastColorRef.current) {
      setFadingOutColor(lastColorRef.current);
      lastColorRef.current = null;

      // Clear fading out color after animation
      const timer = setTimeout(() => setFadingOutColor(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentColor]);

  return (
    <div className="relative min-h-screen text-white p-8">
      {/* Background base (slate) */}
      <div
        className="fixed inset-0 -z-30"
        style={{
          background:
            "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)",
        }}
      />

      {/* Fading out color layer */}
      {fadingOutColor && (
        <div
          className="fixed inset-0 -z-20 animate-fade-out"
          style={{
            background: `linear-gradient(to bottom right, ${fadingOutColor}, #0f172a)`,
          }}
        />
      )}

      {/* Current color layer (fades in) */}
      {currentColor && (
        <div
          key={fadeKey}
          className="fixed inset-0 -z-10 animate-fade-in"
          style={{
            background: `linear-gradient(to bottom right, ${currentColor}, #0f172a)`,
          }}
        />
      )}
      {/* Container pour le logo et le titre (limité en largeur) */}
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
      </div>

      {/* Grille des artistes (Pleine largeur) */}
      {!isLoading && !error && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
          onMouseLeave={() => setCurrentColor(null)}
        >
          {artists.map((artist) => (
            <Card
              key={artist.id}
              className="group relative h-96 overflow-hidden rounded-2xl cursor-pointer shadow-2xl transition-all hover:-translate-y-2 border-0 bg-transparent p-0"
              onMouseEnter={() => {
                setCurrentColor(artist.color ?? null);
              }}
              onClick={() => {
                setSelectedArtist(artist);
                setIsDialogOpen(true);
              }}
            >
              <CardContent className="p-0 h-full w-full relative">
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
                      Dernier album : {artist.year}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message si aucun artiste */}
      {!isLoading && !error && artists.length === 0 && (
        <div className="max-w-4xl mx-auto text-center py-12 text-slate-400">
          <p className="text-2xl mb-2">📭</p>
          <p>Aucun artiste trouvé</p>
        </div>
      )}

      <ArtistDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedArtist={selectedArtist}
      />
    </div>
  );
}
