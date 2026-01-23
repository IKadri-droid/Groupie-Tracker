import ConcertGlobe, {
  type ConcertGlobeHandle,
} from "./components/ConcertGlobe";
import GlobeSidebar from "./components/GlobeSidebar";
import type { Artist } from "@/features/artists";
import { useState, useRef } from "react";

export default function GlobeLayout({ artists }: { artists: Artist[] }) {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const globeRef = useRef<ConcertGlobeHandle>(null);

  const handlePointClick = (artist: Artist) => {
    setSelectedArtist(artist);
  };

  const handleConcertClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    if (globeRef.current) {
      globeRef.current.flyTo(lat, lng);
    }
  };

  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  return (
    <div className="flex h-[1000px] w-full bg-transparent rounded-xl overflow-hidden relative mt-8">
      {/* Menu Latéral en Absolute */}
      <div className="absolute top-4 left-4 z-20 h-[calc(100%-2rem)] flex items-center">
        <GlobeSidebar
          artist={selectedArtist}
          artists={artists}
          onConcertClick={handleConcertClick}
        />
      </div>
      {/* Le Globe prend toute la place */}
      <div className="w-full flex items-center justify-center ">
        <ConcertGlobe
          ref={globeRef}
          artists={artists}
          onPointClick={handlePointClick}
          selectedCoords={selectedCoords}
        />
      </div>
    </div>
  );
}
