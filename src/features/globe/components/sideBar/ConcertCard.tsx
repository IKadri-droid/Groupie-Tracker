import type { Concert } from "@/features/artists";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, Ticket, Users, Heart } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useNavigate } from "@tanstack/react-router"; // Pour la redirection

// C'est ici que tu définis tes props !
interface ConcertCardProps {
  concert: Concert & { artistName: string; artistImage?: string };
  isExpanded: boolean;
  onToggleExpand: () => void;
  onConcertClick?: (lat: number, lng: number) => void;
}

export default function ConcertCard({
  concert,
  isExpanded,
  onToggleExpand,
  onConcertClick,
}: ConcertCardProps) {
  function handleCardClick() {
    onToggleExpand();
    if (!isExpanded && onConcertClick) {
      // On ne zoom que si on ouvre la carte
      onConcertClick(concert.latitude, concert.longitude);
    }
  }
  const { user } = useAuthStore();
  const navigate = useNavigate();
  return (
    <motion.div
      onClick={handleCardClick}
      className={`
    relative cursor-pointer
    p-3 rounded-xl border border-white/20
    bg-gradient-to-br from-white/10 via-white/5 to-white/10
    backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]
    hover:from-white/20 hover:via-white/10 hover:to-white/15 hover:border-white/30
    transition-all duration-300
    ${isExpanded ? "ring-1 ring-white/30 bg-white/15" : ""}
  `}
    >
      <div className="flex flex-col gap-0.5">
        {/* Nom de l'artiste */}
        <h3 className="font-bold">{concert.artistName}</h3>

        {/* Lieu */}
        <p className="text-sm opacity-80">{concert.location}</p>

        {/* Date */}
        <p className="text-xs opacity-60">
          {new Date(concert.date).toLocaleDateString("fr-FR")}
        </p>
      </div>

      {/* Contenu Dépliable (Animation) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-col gap-1">
                <div className="grid grid-cols-3 gap-4">
                  {/* Colonne 1 : Heure */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-white/60 text-xs uppercase font-medium tracking-wider">
                      <Clock className="h-3 w-3" />
                      Heure
                    </div>
                    <div className="text-white font-medium">
                      {concert.time || "20:00"}
                    </div>
                  </div>

                  {/* Colonne 2 : Places */}
                  <div className="flex flex-col gap-1 col-span-2">
                    <div className="flex items-center gap-2 text-white/60 text-xs uppercase font-medium tracking-wider whitespace-nowrap">
                      <Ticket className="h-3 w-3" />
                      Places restantes
                    </div>
                    <div className="text-white font-medium">
                      {concert.available_seats || 193}
                    </div>
                  </div>
                </div>

                {/* Salle */}
                <div className="flex items-center gap-2 text-white/60 text-xs uppercase font-medium tracking-wider mt-2">
                  <MapPin className="h-3 w-3" />
                  Salle
                </div>
                <div className="text-white font-medium">
                  {concert.venue || "Stade de France"}
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center gap-3 mt-4">
                  {/* Bouton Acheter */}
                  <button
                    className="flex-1 bg-white text-black font-bold py-2 px-4 rounded-lg text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(concert.ticket_url || "#", "_blank");
                    }}
                  >
                    <Ticket className="h-4 w-4" />
                    Acheter un billet
                  </button>

                  {/* Bouton Favoris */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        alert(
                          "Veuillez vous connecter pour ajouter aux favoris !",
                        );
                        return;
                      }
                      console.log("Ajout aux favoris !", concert.id);
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
