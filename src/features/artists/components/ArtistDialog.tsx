import type { Artist } from "../types/artist.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  useDeezerArtist,
  useDeezerTopTracks,
  useDeezerAlbums,
} from "@/features/deezer";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { Play, Pause } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  selectedArtist: Artist | null;
  onShowOnGlobe?: (artistName: string) => void;
}

export default function ArtistDialog({
  isDialogOpen,
  setIsDialogOpen,
  selectedArtist,
  onShowOnGlobe,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState([1]); // Tableau car le Slider Shadcn attend un tableau (0 à 1)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const handleVolumeChange = (value: [number]) => {
    const newVol = value[0];
    setVolume([newVol]);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const { data: deezerArtist } = useDeezerArtist(selectedArtist?.name || "");
  const { data: deezerAlbums } = useDeezerAlbums(deezerArtist?.id || 0);
  const { data: deezerTopTracks } = useDeezerTopTracks(deezerArtist?.id || 0);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="overflow-hidden min-h-152 w-full rounded-3xl sm:!max-w-4xl bg-gradient-to-br from-white/15 via-white/5 to-white/10 border border-white/40 backdrop-blur-xl shadow-[inset_0_2px_3px_rgba(255,255,255,0.6),0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] text-white [&>button]:hidden ">
        <DialogHeader className="flex gap-4">
          {selectedArtist?.image_url ? (
            <img
              className="w-56 h-56 object-cover rounded-2xl"
              src={selectedArtist.image_url}
              alt={selectedArtist.name}
            />
          ) : (
            <div className="h-full w-full bg-slate-800 flex items-center justify-center rounded-2xl">
              <span className="text-6xl">🎵</span>
            </div>
          )}
          <DialogTitle className="text-5xl">{selectedArtist?.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 border-2 border-white/20 divide-x divide-white/20 text-center text-2xl font-bold rounded-lg">
          {/* dernier album */}
          <div className="p-4 flex flex-col items-center min-h-[300px]">
            <h1 className="mb-2">Dernier album</h1>
            {deezerAlbums?.[0]?.cover_medium && (
              <img
                className="rounded-2xl mb-2 w-48 h-48"
                src={deezerAlbums[0].cover_medium}
                alt="Cover"
              />
            )}
            <p className="font-extralight text-lg">
              {deezerAlbums?.[0]?.title}
            </p>
          </div>

          {/* --- COLONNE DU MILIEU : Son le plus écouté --- */}
          <div className="p-4 flex flex-col items-center h-full relative z-10">
            <h1 className="mb-2">Son le plus écouté</h1>

            <div className="flex-1 w-full flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <div className="absolute right-full  top-1/2 -translate-y-1/2 flex items-center justify-center h-40 w-24">
                  <Slider
                    defaultValue={[1]}
                    max={1}
                    step={0.01}
                    value={volume} // Utilise state volume
                    orientation="vertical"
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer"
                  />
                </div>

                {/* Lecteur Audio (Invisible) */}
                <audio
                  ref={audioRef}
                  src={deezerTopTracks?.[0]?.preview}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* BOUTON PLAY (Reste statique au centre) */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full border-4 border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-105 shadow-xl"
                >
                  {isPlaying ? (
                    <Pause className="h-10 w-10 fill-current" />
                  ) : (
                    // ml-2 compense visuellement le triangle pour qu'il paraisse centré
                    <Play className="h-10 w-10 fill-current" />
                  )}
                </Button>
              </div>
            </div>

            {/* 3. Titre de la chanson en bas */}
            <p className="mt-2 font-bold text-lg truncate w-full max-w-[220px]">
              {deezerTopTracks?.[0]?.title}
            </p>
          </div>
          {/* prochain concert */}
          <div className="p-4 flex flex-col items-center">
            <h1 className="mb-2">Prochains concerts</h1>
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              {selectedArtist?.concerts &&
              selectedArtist.concerts.length > 0 ? (
                <>
                  <Button
                    onClick={() =>
                      selectedArtist && onShowOnGlobe?.(selectedArtist.name)
                    }
                    className="group relative overflow-hidden bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-6 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2">
                      Voir les dates
                    </span>
                    <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4 opacity-50">📅</div>
                  <p className="text-lg font-medium text-white/60">
                    Aucun concert prévu
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
