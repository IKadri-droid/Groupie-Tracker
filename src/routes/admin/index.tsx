import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useArtists, ArtistFormDialog } from "@/features/artists";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import AdminArtistCard from "./components/AdminArtistCard";
import { useAuthStore } from "@/features/auth";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    const { user, token } = useAuthStore.getState();
    if (!token || user?.role !== 'admin') {
      throw redirect({
        to: "/",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: artists = [] } = useArtists();
  const [isArtistFormDialog, setIsArtistFormDialog] = useState(false);

  return (
    <div className="min-h-screen p-8">
      {/* Titre */}
      <div className="flex items-center mt-28">
        <div className="flex-1"></div>

        <h1 className="text-6xl text-center flex-1">Admin</h1>

        <div className="flex-1 flex justify-end pr-1">
          <Button>Trier</Button>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {artists.map((artist) => (
          <AdminArtistCard artist={artist} />
        ))}
        <Card
          className="group relative h-96 overflow-hidden rounded-2xl cursor-pointer shadow-2xl transition-all hover:-translate-y-2 border-0 bg-transparent p-0"
          onClick={() => setIsArtistFormDialog(true)}
        >
          <CardContent className="h-full w-full flex items-center justify-center p-0">
            <Plus className="w-16 h-16 text-slate-400" />
          </CardContent>
        </Card>
      </div>
      <ArtistFormDialog
        open={isArtistFormDialog}
        onOpenChange={setIsArtistFormDialog}
      />
    </div>
  );
}
