import { Button } from "@/shared/components/ui/button";
import { Music2 } from "lucide-react";

export function FavoritesTab() {
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 text-center">
      <Music2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">Vos artistes favoris</h3>
      <p className="text-slate-400 mb-6">
        Vous n'avez pas encore ajouté d'artistes à vos favoris.
      </p>
      <Button
        variant="outline"
        className="border-white/20 text-white bg-transparent hover:bg-white/10"
      >
        Explorer les artistes
      </Button>
    </div>
  );
}
