import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { useState, useEffect } from "react";
import { useCreateArtist, useUpdateArtist } from "../hooks/useArtists";
import type { Artist } from "../types/artist.types";

interface ArtistFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist?: Artist;
}

export default function ArtistFormDialog({
  open,
  onOpenChange,
  artist,
}: ArtistFormDialogProps) {
  const createArtistMutation = useCreateArtist();
  const updateArtistMutation = useUpdateArtist();
  const [newArtist, setNewArtist] = useState({
    name: "",
    genre: "",
    year: 0,
    image_url: "",
    color: "",
    next_concert: "",
  });

  useEffect(() => {
    if (artist) {
      setNewArtist({
        name: artist.name,
        genre: artist.genre,
        year: artist.year,
        image_url: artist.image_url ?? "",
        color: artist.color ?? "",
        next_concert: artist.next_concert ?? "",
      });
    }
  }, [artist]);
  const isFormValid = () => {
    return (
      newArtist.name.trim() !== "" &&
      newArtist.genre.trim() !== "" &&
      newArtist.image_url.trim() !== "" &&
      newArtist.year > 0
    );
  };

  const resetForm = () => {
    setNewArtist({
      name: "",
      genre: "",
      year: 0,
      image_url: "",
      color: "",
      next_concert: "",
    });
  };

  const handleSuccess = () => {
    onOpenChange(false);
    resetForm(); // une fonction qui vide le state
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {artist ? "Modifier l'artiste" : "Ajouter un artiste"}
          </DialogTitle>
        </DialogHeader>
        {/* Le formulaire ira ici */}
        <Label htmlFor="name">
          Nom de l'artiste<span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="SCH"
          id="name"
          value={newArtist.name}
          onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
        />
        <Label htmlFor="genre">
          Genre<span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="RAP"
          id="genre"
          value={newArtist.genre}
          onChange={(e) =>
            setNewArtist({ ...newArtist, genre: e.target.value })
          }
        />
        <Label htmlFor="year">
          Année du dernier album<span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="2023"
          id="year"
          value={newArtist.year}
          onChange={(e) =>
            setNewArtist({ ...newArtist, year: Number(e.target.value) })
          }
        />
        <Label htmlFor="image_url">
          Image URL<span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="https://google.com"
          id="image_url"
          value={newArtist.image_url}
          onChange={(e) =>
            setNewArtist({ ...newArtist, image_url: e.target.value })
          }
        />
        <Label htmlFor="color">Couleur de fond</Label>
        <Input
          placeholder="#ffffff"
          id="color"
          value={newArtist.color}
          onChange={(e) =>
            setNewArtist({ ...newArtist, color: e.target.value })
          }
        />
        <Label htmlFor="next_concert">Prochain concerts</Label>
        <Input
          placeholder="4 janvier Zénith de Lille"
          id="next_concert"
          value={newArtist.next_concert}
          onChange={(e) =>
            setNewArtist({ ...newArtist, next_concert: e.target.value })
          }
        />
        <Button
          className="mt-4"
          disabled={!isFormValid()}
          onClick={() => {
            if (artist) {
              updateArtistMutation.mutate(
                {
                  id: artist.id,
                  artist: { ...newArtist, id: artist.id },
                },
                { onSuccess: handleSuccess },
              );
            } else {
              createArtistMutation.mutate(newArtist, {
                onSuccess: handleSuccess,
              });
            }
          }}
        >
          {artist ? "Enregistrer" : "Créer"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
