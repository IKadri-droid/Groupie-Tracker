import { Info } from "lucide-react";

interface PasswordStrengthProps {
  strength: number; // Le score (0-5)
  value: string; // Le texte du mot de passe (pour savoir si on affiche ou pas)
}

export function PasswordStrength({ strength, value }: PasswordStrengthProps) {
  if (!value) return null; // Si vide, on n'affiche rien)
  //password strength

  return (
    value && (
      <div>
        <div className="flex gap-2 mt-2 h-1">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={`h-full w-full rounded-full transition-all duration-300 ${
                index < strength
                  ? strength <= 1
                    ? "bg-red-500" // Niveau 1
                    : strength <= 2
                      ? "bg-orange-500" // Niveau 2
                      : strength <= 3
                        ? "bg-yellow-500" // Niveau 3
                        : strength <= 4
                          ? "bg-green-500" // Niveau 4
                          : "bg-emerald-600" // Niveau 5 (Vert foncé)
                  : "bg-slate-700" // Case vide (Gris)
              }`}
            ></div>
          ))}
        </div>
        <div className="flex items-center">
          {/*Indicateur de Niveau de sécurité*/}
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Force :{" "}
            {
              [
                "",
                "Mot de passe en mousse",
                "Ça tremble un peu",
                "Ça devient sérieux",
                "Coffre-fort de Batman",
                "Trump dans les dossier de Epstein",
              ][strength]
            }
          </p>
          <div className="group relative">
            <Info className="h-4 w-4 text-slate-500 cursor-help mt-1 ml-1" />
            {/* Tooltip artisanal en CSS pur */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-xs text-slate-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Pour un mot de passe sécurisé
              <br />
              - 8 caractères min <br />
              - 1 Majuscule <br />
              - 1 Chiffre <br />- 1 Caractère spécial
            </div>
          </div>
        </div>
      </div>
    )
  );
}
