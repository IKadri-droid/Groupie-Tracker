import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const concertSearchSchema = z.object({
  artistName: z.string(),
  image: z.string().optional(),
  image_concert: z.string().optional(),
  venue: z.string().optional(),
  date: z.string(),
  city: z.string().optional(),
  price: z.string().optional(),
  concertId: z.number().optional(),
});

export const Route = createFileRoute("/pre-checkout")({
  validateSearch: (search) => concertSearchSchema.parse(search),
  component: RouteComponent,
});

import { useAuthStore } from "../features/auth/store/authStore";
import { API_BASE_URL } from "@/shared/config/api";

function RouteComponent() {
  const {
    artistName,
    image,
    image_concert,
    venue,
    date,
    city,
    price,
    concertId,
  } = Route.useSearch();
  const [standardQty, setStandardQty] = useState(0);
  const [vipQty, setVipQty] = useState(0);
  const { token, user } = useAuthStore();

  // Parse price safely or default to 45
  const basePrice = price ? parseFloat(price.replace(/[^0-9.]/g, "")) : 45;
  const PRICE_STANDARD = basePrice;
  const PRICE_VIP = Math.round(basePrice * 2.5); // VIP is roughly 2.5x standard

  const total = standardQty * PRICE_STANDARD + vipQty * PRICE_VIP;

  const handlePayment = async () => {
    // Debug: afficher l'état du token
    console.log(
      "Token présent:",
      !!token,
      "Token value:",
      token?.substring(0, 20) + "...",
    );
    console.log("User connecté:", !!user, user);
    console.log("Concert ID:", concertId);

    if (!token || !user) {
      alert(
        "Veuillez vous connecter pour procéder au paiement. Token: " +
          (token ? "présent" : "absent"),
      );
      return;
    }

    if (standardQty === 0 && vipQty === 0) {
      alert("Veuillez sélectionner au moins un billet.");
      return;
    }

    // NOTE: Le backend actuel ne gère pas encore les quantités/types de billets
    // On envoie juste concert_id pour l'instant comme demandé
    try {
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          concert_id: concertId,
          quantity: standardQty,
          vip_quantity: vipQty,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur backend:", response.status, errorText);
        if (response.status === 401) {
          alert("Session expirée. Veuillez vous reconnecter.");
          return;
        }
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Erreur paiement:", error);
      alert("Une erreur est survenue lors de l'initialisation du paiement.");
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      {/* Background base (slate) */}
      <div
        className="fixed inset-0 -z-30"
        style={{
          background:
            "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)",
        }}
      />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-20 px-4 mt-20">
        {/* Colonne de gauche (Image) - Prend 5 colonnes sur 12 */}
        <div className="lg:col-span-5 p-4 flex flex-col items-center lg:items-end w-full">
          {/* Le Container de l'image (Poster) */}
          <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 group">
            <img
              src={
                image_concert ||
                "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070&auto=format&fit=crop"
              }
              alt={artistName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Boutons d'actions overlay (Cœur et Partage) comme sur ta maquette */}
          </div>
        </div>

        {/* Colonne de droite - Prend 7 colonnes sur 12 */}
        <div className="lg:col-span-7 p-4 lg:pl-12 flex flex-col gap-6">
          <div className="flex flex-col gap-2 items-start text-left">
            {/* Titre Artiste */}
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-2">
              {artistName}
            </h1>

            {/* Lieu */}
            <p className="text-xl text-slate-300 font-medium">
              {venue || "TBA"}
            </p>

            {/* Date (En dégradé comme sur la page index) */}
            <p className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent font-bold text-lg mb-4 w-fit">
              {new Date(date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {/* Tags */}
            <div className="flex gap-3">
              <span className="px-3 py-1 rounded-full bg-white/10 text-sm backdrop-blur-md border border-white/10 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> {city || "Unknown City"}
              </span>
            </div>
          </div>
          {/* Section Billets */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4">Sélectionnez vos billets</h3>

            <div className="space-y-3">
              {/* Billet Standard */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 hover:border-white/20 group">
                <div>
                  <div className="font-bold">Pose (Fosse)</div>
                  <div className="text-sm text-slate-400">
                    Debout - Placement libre
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-mono bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent font-bold">
                    {PRICE_STANDARD}.00 €
                  </div>

                  {/* Compteur */}
                  <div className="flex items-center bg-white/10 rounded-full">
                    {/* Bouton Moins (seulement si quantité > 0) */}
                    {standardQty > 0 && (
                      <button
                        onClick={() =>
                          setStandardQty((q) => Math.max(0, q - 1))
                        }
                        className="w-8 h-8 rounded-full hover:bg-white hover:text-black flex items-center justify-center transition-all"
                      >
                        -
                      </button>
                    )}

                    {/* Affichage Quantité */}
                    <span
                      className={`font-bold w-8 text-center ${standardQty > 0 ? "text-white" : "text-white/30"}`}
                    >
                      {standardQty}
                    </span>

                    {/* Bouton Plus */}
                    <button
                      onClick={() => setStandardQty((q) => q + 1)}
                      className="w-8 h-8 rounded-full hover:bg-white hover:text-black flex items-center justify-center transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Billet VIP */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 hover:border-white/20 group">
                <div>
                  <div className="font-bold flex items-center gap-2">
                    VIP
                    <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">
                      LIMITED
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Accès prioritaire + Coupe-file
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-mono bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent font-bold">
                    {PRICE_VIP}.00 €
                  </div>

                  {/* Compteur VIP */}
                  <div className="flex items-center bg-white/10 rounded-full">
                    {/* Bouton Moins */}
                    {vipQty > 0 && (
                      <button
                        onClick={() => setVipQty((q) => Math.max(0, q - 1))}
                        className="w-8 h-8 rounded-full hover:bg-white hover:text-black flex items-center justify-center transition-all"
                      >
                        -
                      </button>
                    )}

                    {/* Affichage Quantité */}
                    <span
                      className={`font-bold w-8 text-center ${vipQty > 0 ? "text-white" : "text-white/30"}`}
                    >
                      {vipQty}
                    </span>

                    {/* Bouton Plus */}
                    <button
                      onClick={() => setVipQty((q) => q + 1)}
                      className="w-8 h-8 rounded-full hover:bg-white hover:text-black flex items-center justify-center transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Total et Bouton Checkout */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-slate-400">Total</span>
                <span className="text-2xl font-bold">{total.toFixed(2)} €</span>
              </div>
              <button
                onClick={handlePayment}
                className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/20"
              >
                Payer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
