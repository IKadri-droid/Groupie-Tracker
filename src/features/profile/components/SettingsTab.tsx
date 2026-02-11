import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Settings, LogOut } from "lucide-react";

interface SettingsTabProps {
  email: string;
  onLogout: () => void;
}

export function SettingsTab({ email, onLogout }: SettingsTabProps) {
  return (
    <Card className="bg-slate-900 border-white/10 text-white w-full">
      <CardHeader>
        <CardTitle>Paramètres du compte</CardTitle>
        <CardDescription className="text-slate-400">
          Gérez vos informations personnelles et vos préférences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informations */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email</label>
          <div className="p-3 bg-slate-950 border border-white/10 rounded-lg text-slate-400 cursor-not-allowed max-w-md">
            {email}
          </div>
          <p className="text-xs text-slate-500">
            L'adresse email ne peut pas être modifiée pour le moment.
          </p>
        </div>

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            className="justify-start border-white/20 hover:bg-white/10 text-white bg-transparent px-6"
          >
            <Settings className="w-4 h-4 mr-2" />
            Modifier le profil
          </Button>

          <Button
            variant="ghost"
            className="justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 px-6"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Zone Danger */}
        <div className="pt-4 border-t border-white/10">
          <Button variant="destructive" className="w-full sm:w-auto">
            Supprimer mon compte
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
