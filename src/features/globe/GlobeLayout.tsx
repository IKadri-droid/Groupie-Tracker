import ConcertGlobe from "./components/ConcertGlobe";
import GlobeSidebar from "./components/GlobeSidebar";
import type { Artist } from "@/features/artists";
import { useState } from "react";

export default function GlobeLayout({ artists }: { artists: Artist[] }) {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const handlePointClick = (artist: Artist) => {
    setSelectedArtist(artist);
  };

  return (
    <div className="flex h-[1000px] w-full bg-transparent rounded-xl overflow-hidden relative mt-8">
      {/* Menu Latéral en Absolute */}
      <div className="absolute top-4 left-4 z-20 h-[calc(100%-2rem)]">
        <GlobeSidebar artist={selectedArtist} artists={artists} />
      </div>
      {/* Le Globe prend toute la place */}
      <div className="w-full flex items-center justify-center ">
        <ConcertGlobe artists={artists} onPointClick={handlePointClick} />
      </div>
    </div>
  );
}
