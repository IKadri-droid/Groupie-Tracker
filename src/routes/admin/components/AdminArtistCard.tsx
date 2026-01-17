import {
  ArtistCard,
  ArtistFormDialog,
  useDeleteArtist,
} from "@/features/artists";
import type { Artist } from "@/features/artists";
import { Button } from "@/shared/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface Prop {
  artist: Artist;
}

export default function AdminArtistCard({ artist }: Prop) {
  const deleteArtistMutation = useDeleteArtist();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <div className="relative group ">
      <ArtistCard
        key={artist.id}
        artist={artist}
        disableHover={true}
        onClick={() => {}}
      />
      <div className="absolute  top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ">
        {/*EDIT BUTTON*/}
        <Button
          size="icon"
          variant="secondary"
          onClick={(e) => {
            setIsEditDialogOpen(true);
            e.stopPropagation(); // Empêche le onClick de la carte
          }}
        >
          {" "}
          <Pencil className="h-4 w-4" />
        </Button>

        {/*DELETE BUTTON*/}
        <Button
          size="icon"
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            deleteArtistMutation.mutate(artist.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ArtistFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        artist={artist}
      />
    </div>
  );
}
