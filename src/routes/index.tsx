import { createFileRoute } from "@tanstack/react-router";
import {
  useArtists,
  ArtistDialog,
  Carousel3D,
  type Artist,
  type CarouselHandle,
} from "@/features/artists";
import { useState, useRef, useMemo, useEffect } from "react";
import GlobeLayout from "@/features/globe/GlobeLayout";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const carouselRef = useRef<CarouselHandle>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredArtists = useMemo(() => {
    if (!searchTerm) return [];
    return artists.filter((artist) =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [artists, searchTerm]);

  const handleSearchSelect = (artist: Artist) => {
    if (carouselRef.current) {
      carouselRef.current.scrollToArtist(artist.id);
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

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

  const [showGlobe, setShowGlobe] = useState(false);

  useEffect(() => {
    // Delay globe rendering to keep the header transition smooth
    const timer = setTimeout(() => setShowGlobe(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen text-white">
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

      {/* Container pour le logo et le titre */}
      <div className="w-full p-8">
        <div className="max-w-4xl mx-auto relative flex flex-col items-center">
          {/* Effet de forme en dégradé derrière le logo */}
          <div className="hero-glow" />

          <img
            src="/logo.png"
            alt="logo"
            className="pt-70 pb-70 relative z-10"
          />
        </div>
      </div>

      {/* En-tête full width pour permettre au bouton d'être à droite */}
      <div className="relative flex items-center justify-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent w-fit">
          Les Artistes
        </h1>

        <div
          className="absolute right-0 flex items-center h-10 pr-8"
          ref={searchRef}
        >
          <motion.div
            initial={false}
            animate={{ width: isSearchOpen ? 300 : 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={() => !isSearchOpen && setIsSearchOpen(true)}
            className={`relative h-10 overflow-hidden bg-gradient-to-br from-black/70 via-gray-900/80 to-black/75 border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.4)] rounded-xl ${!isSearchOpen ? "cursor-pointer" : ""}`}
          >
            <div className="flex items-center h-full px-2">
              <Search
                className="h-5 w-5 text-white cursor-pointer flex-shrink-0"
                onClick={(e) => {
                  if (isSearchOpen) {
                    e.stopPropagation();
                    setIsSearchOpen(false);
                  }
                }}
              />

              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher un artiste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`ml-2 bg-transparent border-none text-white outline-none flex-1 placeholder-white/30 text-sm transition-opacity duration-300 ${isSearchOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              />

              {isSearchOpen && searchTerm && (
                <X
                  className="h-4 w-4 text-white/50 cursor-pointer hover:text-white"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>
          </motion.div>

          {/* Résultats de recherche - Sortis du conteneur overflow-hidden */}
          <AnimatePresence>
            {isSearchOpen && searchTerm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-12 left-0 right-0 bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] backdrop-blur-xl min-w-[300px]"
              >
                <div className="max-h-60 overflow-y-auto p-1 text-slate-200">
                  {filteredArtists.length > 0 ? (
                    filteredArtists.map((artist) => (
                      <div
                        key={artist.id}
                        onClick={() => handleSearchSelect(artist)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/10 cursor-pointer flex items-center justify-between group"
                      >
                        <span className="text-white/90 font-medium group-hover:text-white">
                          {artist.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-sm text-white/40 text-center italic">
                      Aucun artiste trouvé
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Affichage de l'erreur */}
      {error && (
        <div className="max-w-4xl mx-auto bg-red-500/20 border border-red-500 rounded-xl p-4 text-center mb-8">
          <p className="text-red-400">{error.message}</p>
        </div>
      )}

      {/* Spinner de chargement */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Carousel 3D des artistes */}
      {!isLoading && !error && (
        <div className="w-full -mt-4">
          <Carousel3D
            ref={carouselRef}
            artists={artists}
            onArtistClick={(artist) => {
              setSelectedArtist(artist);
              setIsDialogOpen(true);
            }}
            onHoverArtist={(color) => setCurrentColor(color)}
          />
        </div>
      )}
      {showGlobe && <GlobeLayout artists={artists} />}
      <ArtistDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedArtist={selectedArtist}
      />
    </div>
  );
}
