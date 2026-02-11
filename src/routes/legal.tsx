import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
export const Route = createFileRoute("/legal")({
  component: LegalPage,
});
function LegalPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-900 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Mentions Légales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                1. Éditeur du site
              </h2>
              <p>
                Le site Groupie-Tracker est édité dans le cadre d'un projet
                pédagogique par :<br />
                <strong>Thomas Le Guern</strong>
                <br />
                Étudiant à YNOV Campus.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                2. Hébergement
              </h2>
              <p>
                Le site est hébergé par <strong>Vercel Inc.</strong>
                <br />
                Adresse : 340 S Lemon Ave #4133 Walnut, CA 91789, USA.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                3. Propriété intellectuelle
              </h2>
              <p>
                L'ensemble de ce site relève de la législation française et
                internationale sur le droit d'auteur et la propriété
                intellectuelle. Toutes les données récupérées via l'API Groupie
                Tracker appartiennent à leurs propriétaires respectifs.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
