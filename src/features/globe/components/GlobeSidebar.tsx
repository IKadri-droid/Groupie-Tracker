import type { Artist } from "@/features/artists";
import { Card } from "@/shared/components/ui/card";

interface GlobeSidebarProps {
  artist: Artist | null;
  artists: Artist[];
}

export default function GlobeSidebar({ artist, artists }: GlobeSidebarProps) {
  return (
    <Card className="w-[300px] h-full backdrop-blur-sm p-4 backdrop-blur-lg bg-white/30 dark:bg-black/30 text-white mt-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
        Les Concerts
      </h1>
      <Card></Card>
    </Card>
  );
}
