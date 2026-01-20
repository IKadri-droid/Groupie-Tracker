import type { Artist } from "@/features/artists";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { ListFilter } from "lucide-react";

interface GlobeSidebarProps {
  artist: Artist | null;
  artists: Artist[];
}

export default function GlobeSidebar({ artist, artists }: GlobeSidebarProps) {
  const allConcerts = artists.flatMap((artist) => {
    if (!artist.concerts) return [];
    return artist.concerts.map((concert) => ({
      ...concert,
      artistName: artist.name, // On ajoute le nom pour l'affichage
      artistImage: artist.image_url,
    }));
  });

  return (
    <Card className="w-[310px] h-[800px] overflow-hidden rounded-3xl p-4 bg-gradient-to-br from-white/15 via-white/5 to-white/10 border border-white/40 backdrop-blur-xl shadow-[inset_0_2px_3px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] text-white ">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
          Les Concerts
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-white bg-gradient-to-br from-white/15 via-white/5 to-white/10 border border-white/40 backdrop-blur-xl shadow-[inset_0_2px_3px_rgba(255,255,255,0.6),0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/20 rounded-lg"
        >
          <ListFilter className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto max-h-full rounded-lg scrollbar-hide">
        {allConcerts.map((concert) => (
          <div
            key={concert.id}
            className="p-3 border rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <h3 className="font-bold">{concert.artistName}</h3>
            <p className="text-sm opacity-80">{concert.location}</p>
            <p className="text-xs opacity-60">
              {new Date(concert.date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
