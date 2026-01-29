import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useArtists, ArtistFormDialog } from "@/features/artists";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import AdminArtistCard from "@/features/artists/components/AdminArtistCard";
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
    <div className="relative min-h-screen text-white p-8">
      {/* Background base (slate) */}
      <div
        className="fixed inset-0 -z-30"
        style={{
          background:
            "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)",
        }}
      />

      {/* Titre */}
      <div className="flex items-center mt-28">
        <div className="flex-1"></div>

        <h1 className="text-6xl text-center font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-2 flex-1">
          Admin
        </h1>

        <div className="flex-1 flex justify-end pr-1">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Trier
          </Button>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {artists.map((artist) => (
          <AdminArtistCard artist={artist} />
        ))}
        <Card
          className="group relative h-96 overflow-hidden rounded-2xl cursor-pointer shadow-2xl transition-all hover:-translate-y-2 border border-white/10 bg-white/5 backdrop-blur-sm p-0 flex items-center justify-center hover:bg-white/10 hover:border-white/20"
          onClick={() => setIsArtistFormDialog(true)}
        >
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-orange-400/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" />
            </div>
            <p className="text-slate-400 font-medium group-hover:text-white transition-colors">Ajouter un artiste</p>
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
