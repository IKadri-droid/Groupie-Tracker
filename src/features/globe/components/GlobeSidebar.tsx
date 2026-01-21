import type { Artist } from "@/features/artists";
import { Card } from "@/shared/components/ui/card";
import { useState, useMemo } from "react";
import SidebarControls from "./sideBar/SidebarControls";

interface GlobeSidebarProps {
  artist: Artist | null;
  artists: Artist[];
}

export default function GlobeSidebar({ artist, artists }: GlobeSidebarProps) {
  const allConcerts = artists.flatMap((artist) => {
    if (!artist.concerts) return [];
    return artist.concerts.map((concert) => ({
      ...concert,
      artistName: artist.name,
      artistImage: artist.image_url,
    }));
  });

  const [sortBy, setSortBy] = useState<"date" | "location">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

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
    <Card className="w-[310px] h-[800px] overflow-hidden rounded-3xl p-4 bg-gradient-to-br from-white/15 via-white/5 to-white/10 border border-white/40 backdrop-blur-xl shadow-[inset_0_2px_3px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] text-white ">
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

      <div className="flex flex-col gap-4 overflow-y-auto max-h-full rounded-lg scrollbar-hide pb-20">
        {sortedConcerts.map((concert) => (
          <div
            key={concert.id}
            className="p-3 rounded-xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] hover:from-white/20 hover:via-white/10 hover:to-white/15 hover:border-white/30 transition-all duration-300"
          >
            <h3 className="font-bold">{concert.artistName}</h3>
            <p className="text-sm opacity-80">{concert.location}</p>
            <p className="text-xs opacity-60">
              {new Date(concert.date).toLocaleDateString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
