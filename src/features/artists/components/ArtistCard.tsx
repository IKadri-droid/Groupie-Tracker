import { Card, CardContent } from "@/shared/components/ui/card";
import type { Artist } from "../types/artist.types";

interface ArtistCardProps {
  artist: Artist;
  onMouseEnter: () => void;
  onClick: () => void;
}

export default function ArtistCard({
  artist,
  onMouseEnter,
  onClick,
}: ArtistCardProps) {
  return (
    <Card
      className="group relative h-96 overflow-hidden rounded-2xl cursor-pointer shadow-2xl transition-all hover:-translate-y-2 border-0 bg-transparent p-0"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
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
            <p
              className="font-medium tracking-wide uppercase text-sm"
              style={{ color: artist.color || "#ec4899" }}
            >
              {artist.genre}
            </p>
            <p className="text-slate-300 text-sm">
              Dernier album : {artist.year}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
