import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-900 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Politique de Confidentialité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                1. Collecte des données
              </h2>
              <p>
                Nous collectons les informations suivantes lors de votre
                inscription : votre nom d'utilisateur et votre adresse e-mail.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                2. Utilisation des données
              </h2>
              <p>
                Vos données sont utilisées exclusivement pour :
                <ul className="list-disc ml-6 mt-2">
                  <li>Gérer votre compte utilisateur.</li>
                  <li>Enregistrer vos artistes favoris.</li>
                  <li>Traiter vos éventuels achats de billets via Stripe.</li>
                </ul>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                3. Conservation des données
              </h2>
              <p>
                Vos données sont conservées tant que votre compte est actif.
                Vous pouvez demander la suppression de votre compte et de vos
                données à tout moment depuis vos paramètres.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                4. Sous-traitants
              </h2>
              <p>
                Nous utilisons les services suivants qui peuvent traiter
                certaines de vos données :
                <ul className="list-disc ml-6 mt-2">
                  <li>
                    <strong>Neon</strong> : Pour le stockage de la base de
                    données et l'authentification.
                  </li>
                  <li>
                    <strong>Stripe</strong> : Pour la gestion sécurisée des
                    paiements (nous ne stockons pas vos données bancaires).
                  </li>
                </ul>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">
                5. Vos droits
              </h2>
              <p>
                Conformément au RGPD, vous disposez d'un droit d'accès, de
                rectification et de suppression de vos données. Pour toute
                demande, contactez l'administrateur.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
