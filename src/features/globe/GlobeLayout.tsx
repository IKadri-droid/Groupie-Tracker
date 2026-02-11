import ConcertGlobe, {
  type ConcertGlobeHandle,
} from "./components/ConcertGlobe";
import GlobeSidebar from "./components/GlobeSidebar";
import type { Artist } from "@/features/artists";
import { useState, useRef } from "react";

export default function GlobeLayout({
  artists,
  searchQuery,
}: {
  artists: Artist[];
  searchQuery?: string;
}) {
  const [expandedConcertId, setExpandedConcertId] = useState<number | null>(
    null,
  );
  const globeRef = useRef<ConcertGlobeHandle>(null);

  const handlePointClick = (_artist: Artist, concertId: number) => {
    setExpandedConcertId(concertId); // On ouvre la carte correspondante !
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
    <div className="flex flex-col lg:flex-row lg:h-[1000px] w-full bg-transparent rounded-xl overflow-hidden relative mt-12 lg:mt-8">
      {/* Le Globe prend toute la place — affiché en premier sur mobile */}
      <div className="w-full flex items-center justify-center h-[500px] lg:h-full">
        <ConcertGlobe
          ref={globeRef}
          artists={artists}
          onPointClick={handlePointClick}
          selectedCoords={selectedCoords}
        />
      </div>
      {/* Menu Latéral — en dessous sur mobile, overlay sur desktop */}
      <div className="w-full px-4 py-4 lg:absolute lg:top-4 lg:left-4 lg:z-20 lg:h-[calc(100%-2rem)] lg:flex lg:items-center lg:w-auto lg:p-0">
        <GlobeSidebar
          artists={artists}
          onConcertClick={handleConcertClick}
          expandedConcertId={expandedConcertId}
          setExpandedConcertId={setExpandedConcertId}
          externalSearchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
