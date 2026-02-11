import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function NextConcertCard() {
  return (
    <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-lg">Prochain Concert</CardTitle>
        <CardDescription className="text-slate-400">
          Ne manquez pas votre prochain événement !
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-black/30 rounded-xl p-4 text-center border border-white/5">
          <span className="block text-4xl font-bold text-pink-500 mb-1">
            15
          </span>
          <span className="block text-sm uppercase text-slate-400 mb-4">
            Mars 2026
          </span>
          <h3 className="font-bold text-lg mb-1">Coldplay</h3>
          <p className="text-xs text-slate-400">Stade de France, Paris</p>
        </div>
        <Button className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white">
          Voir mes billets
        </Button>
      </CardContent>
    </Card>
  );
}
