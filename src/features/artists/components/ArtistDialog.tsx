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
      <DialogContent className="max-h-[85vh] overflow-y-auto w-full rounded-2xl md:rounded-3xl sm:!max-w-4xl bg-gradient-to-br from-white/15 via-white/5 to-white/10 border border-white/40 backdrop-blur-xl shadow-[inset_0_2px_3px_rgba(255,255,255,0.6),0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] text-white [&>button]:hidden p-4 md:p-6">
        <DialogHeader className="flex flex-col md:flex-row gap-4 items-center md:items-start text-center md:text-left">
          {selectedArtist?.image_url ? (
            <img
              className="w-32 h-32 md:w-56 md:h-56 object-cover rounded-2xl shadow-lg"
              src={selectedArtist.image_url}
              alt={selectedArtist.name}
            />
          ) : (
            <div className="w-32 h-32 md:w-56 md:h-56 bg-slate-800 flex items-center justify-center rounded-2xl">
              <span className="text-4xl md:text-6xl">🎵</span>
            </div>
          )}
          <div className="flex flex-col justify-center h-full pt-2 md:pt-4">
            <DialogTitle className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              {selectedArtist?.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-white/20 divide-y md:divide-y-0 md:divide-x divide-white/20 text-center text-xl md:text-2xl font-bold rounded-xl mt-4 bg-black/20">
          {/* dernier album */}
          <div className="p-4 flex flex-col items-center justify-center min-h-[200px] md:min-h-[300px]">
            <h1 className="mb-4 text-white/80 text-sm md:text-base uppercase tracking-wider">
              Dernier album
            </h1>
            {deezerAlbums?.[0]?.cover_medium && (
              <img
                className="rounded-xl mb-3 w-32 h-32 md:w-48 md:h-48 shadow-lg transition-transform hover:scale-105"
                src={deezerAlbums[0].cover_medium}
                alt="Cover"
              />
            )}
            <p className="font-light text-base md:text-lg px-2">
              {deezerAlbums?.[0]?.title}
            </p>
          </div>

          {/* --- COLONNE DU MILIEU : Son le plus écouté --- */}
          <div className="p-6 md:p-4 flex flex-col items-center justify-center h-full relative z-10 min-h-[250px] md:min-h-auto">
            <h1 className="mb-4 text-white/80 text-sm md:text-base uppercase tracking-wider">
              Son le plus écouté
            </h1>

            <div className="flex-1 w-full flex items-center justify-center mb-2">
              <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
                {/* Slider: Horizontal sur mobile, Vertical sur desktop */}
                <div className="flex md:absolute md:right-full md:top-1/2 md:-translate-y-1/2 items-center justify-center h-12 w-48 md:h-40 md:w-24 order-2 md:order-1">
                  <Slider
                    defaultValue={[1]}
                    max={1}
                    step={0.01}
                    value={volume}
                    orientation={
                      window.innerWidth < 768 ? "horizontal" : "vertical"
                    }
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer w-full md:h-full"
                  />
                </div>

                {/* Lecteur Audio (Invisible) */}
                <audio
                  ref={audioRef}
                  src={deezerTopTracks?.[0]?.preview}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* BOUTON PLAY */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlay}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-105 shadow-xl order-1 md:order-2"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 md:h-10 md:w-10 fill-current" />
                  ) : (
                    <Play className="h-8 w-8 md:h-10 md:w-10 fill-current ml-1" />
                  )}
                </Button>
              </div>
            </div>

            {/* 3. Titre de la chanson en bas */}
            <p className="mt-2 font-bold text-base md:text-lg truncate w-full max-w-[220px]">
              {deezerTopTracks?.[0]?.title}
            </p>
          </div>
          {/* prochain concert */}
          <div className="p-4 flex flex-col items-center justify-center min-h-[200px] md:min-h-auto">
            <h1 className="mb-4 text-white/80 text-sm md:text-base uppercase tracking-wider">
              Prochains concerts
            </h1>
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              {selectedArtist?.concerts &&
              selectedArtist.concerts.length > 0 ? (
                <>
                  <Button
                    onClick={() =>
                      selectedArtist && onShowOnGlobe?.(selectedArtist.name)
                    }
                    className="group relative overflow-hidden bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-4 md:px-8 md:py-6 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2 text-sm md:text-base">
                      Voir les dates
                    </span>
                    <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                  </Button>
                </>
              ) : (
                <div className="text-center py-4 md:py-8">
                  <div className="text-3xl md:text-4xl mb-2 md:mb-4 opacity-50">
                    📅
                  </div>
                  <p className="text-base md:text-lg font-medium text-white/60">
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
