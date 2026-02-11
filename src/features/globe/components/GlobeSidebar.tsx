import type { Artist } from "@/features/artists";
import { Card } from "@/shared/components/ui/card";
import { useState, useMemo, useEffect, useRef } from "react";
import SidebarControls from "./sideBar/SidebarControls";
import ConcertCard from "./sideBar/ConcertCard";

interface GlobeSidebarProps {
  artists: Artist[];
  onConcertClick?: (lat: number, lng: number) => void;
  expandedConcertId: number | null;
  setExpandedConcertId: (id: number | null) => void;
  externalSearchQuery?: string;
}

export default function GlobeSidebar({
  artists,
  onConcertClick,
  expandedConcertId,
  setExpandedConcertId,
  externalSearchQuery,
}: GlobeSidebarProps) {
  const allConcerts = artists.flatMap((artist) => {
    if (!artist.concerts) return [];
    return artist.concerts.map((concert) => ({
      ...concert,
      artistName: artist.name,
      artistImage: artist.image_url,
      // On s'assure que les champs snake_case du backend sont bien passés
      venue: concert.venue,
      price: concert.price,
      available_seats: concert.available_seats,
    }));
  });

  const [sortBy, setSortBy] = useState<"date" | "location">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const shouldScrollRef = useRef(true);

  // Effet pour synchroniser la recherche externe
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Effet pour scroller vers la carte ouverte
  useEffect(() => {
    if (expandedConcertId && shouldScrollRef.current) {
      const element = document.getElementById(
        `concert-card-${expandedConcertId}`,
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    shouldScrollRef.current = true; // On réactive le scroll pour les prochains clics (ex: depuis le Globe)
  }, [expandedConcertId]);

  const handleToggleExpand = (id: number) => {
    shouldScrollRef.current = false; // On désactive le scroll auto quand on clique manuellement
    setExpandedConcertId(expandedConcertId === id ? null : id);
  };

  const sortedConcerts = useMemo(() => {
    // 1. Filtrer les concerts
    const filtered = allConcerts.filter((concert) => {
      const search = searchQuery.toLowerCase();
      return (
        concert.artistName.toLowerCase().includes(search) || // Recherche par nom d'artiste
        concert.location.toLowerCase().includes(search) // Recherche par lieu
      );
    });

    return filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "date") {
        comparison = a.date.localeCompare(b.date);
      } else {
        comparison = a.location.localeCompare(b.location);
      }

      // Inverse si ordre décroissant
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [allConcerts, sortBy, sortOrder, searchQuery]);

  const handleSort = (type: "date" | "location") => {
    if (type === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortOrder("asc");
    }
  };

  return (
    <Card className="w-full lg:w-[310px] h-auto max-h-[500px] lg:max-h-none lg:h-[800px] overflow-hidden rounded-3xl p-4 bg-gradient-to-br from-white/15 via-white/5 to-white/10 border border-white/40 backdrop-blur-xl shadow-[inset_0_2px_3px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] text-white ">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
        Les Concerts
      </h1>

      <div>
        <SidebarControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>

      {/* On garde le conteneur défilant */}
      <div className="flex flex-col gap-4 overflow-y-auto max-h-full rounded-lg scrollbar-hide pb-20 px-1">
        {/* On boucle sur les concerts triés */}
        {sortedConcerts.map((concert) => (
          <div key={concert.id} id={`concert-card-${concert.id}`}>
            <ConcertCard
              concert={concert}
              isExpanded={concert.id === expandedConcertId}
              onToggleExpand={() => handleToggleExpand(concert.id)}
              onConcertClick={onConcertClick}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
