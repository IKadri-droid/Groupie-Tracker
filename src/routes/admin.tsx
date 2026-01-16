import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  useArtists,
  ArtistCard,
  type Artist,
  useCreateArtist,
} from "@/features/artists";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const { data: artists = [] } = useArtists();
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const createArtistMutation = useCreateArtist();
  {
    /* State pour stocker les données du formulaire de création d'artistes*/
  }
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
    <div>
      {/* Titre */}
      <div className="flex items-center mt-40">
        <div className="flex-1"></div>

        <h1 className="text-6xl text-center flex-1">Admin</h1>

        <div className="flex-1 flex justify-end pr-1">
          <Button>Trier</Button>
        </div>
      </div>

      <div
        className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
        onMouseLeave={() => setCurrentColor(null)}
      >
        {artists.map((artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onMouseEnter={() => setCurrentColor(artist.color ?? null)}
            onClick={() => {
              setSelectedArtist(artist);
              setIsDialogOpen(true);
            }}
          />
        ))}
        <Card
          className="group relative h-96 overflow-hidden rounded-2xl cursor-pointer shadow-2xl transition-all hover:-translate-y-2 border-0 bg-transparent p-0"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <CardContent className="h-full w-full flex items-center justify-center p-0">
            <Plus className="w-16 h-16 text-black-400"></Plus>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
            onChange={(e) =>
              setNewArtist({ ...newArtist, name: e.target.value })
            }
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
                  setIsCreateDialogOpen(false); // Ferme le dialog
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
    </div>
  );
}
