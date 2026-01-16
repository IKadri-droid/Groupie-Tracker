import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { useState } from "react";
import { useCreateArtist } from "../hooks/useArtists";

interface CreateArtistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateArtistDialog({
  open,
  onOpenChange,
}: CreateArtistDialogProps) {
  const createArtistMutation = useCreateArtist();
  const [newArtist, setNewArtist] = useState({
    name: "",
    genre: "",
    year: 0,
    image_url: "",
    color: "",
    next_concert: "",
  });
  const isFormValid = () => {
    return (
      newArtist.name.trim() !== "" &&
      newArtist.genre.trim() !== "" &&
      newArtist.image_url.trim() !== "" &&
      newArtist.year > 0
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un artiste</DialogTitle>
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
            createArtistMutation.mutate(newArtist, {
              onSuccess: () => {
                onOpenChange(false); // Ferme le dialog
                // Réinitialise le formulaire
                setNewArtist({
                  name: "",
                  genre: "",
                  year: 0,
                  image_url: "",
                  color: "",
                  next_concert: "",
                });
              },
            });
          }}
        >
          Créer
        </Button>
      </DialogContent>
    </Dialog>
  );
}
