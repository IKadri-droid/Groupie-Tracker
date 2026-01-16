import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useArtists, CreateArtistDialog } from "@/features/artists";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import AdminArtistCard from "./components/AdminArtistCard";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: artists = [] } = useArtists();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

      <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {artists.map((artist) => (
          <AdminArtistCard artist={artist}></AdminArtistCard>
        ))}
        <Card
          className="group relative h-96 overflow-hidden rounded-2xl cursor-pointer shadow-2xl transition-all hover:-translate-y-2 border-0 bg-transparent p-0"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <CardContent className="h-full w-full flex items-center justify-center p-0">
            <Plus className="w-16 h-16 text-black-400" />
          </CardContent>
        </Card>
      </div>
      <CreateArtistDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
