import {
  ListFilter,
  Calendar,
  MapPin,
  ArrowUpAz,
  ArrowDownAz,
  Search,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SidebarControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: "date" | "location";
  sortOrder: "asc" | "desc";
  onSort: (type: "date" | "location") => void;
}

export default function SidebarControls({
  searchQuery,
  setSearchQuery,
  sortBy,
  sortOrder,
  onSort,
}: SidebarControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSortClick = (type: "date" | "location") => {
    onSort(type);
    setIsOpen(false);
  };

  return (
    <div className="flex gap-2 items-center">
      {/* Barre de recherche */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
        <input
          type="text"
          placeholder="Rechercher un concert"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-gradient-to-br from-black/50 via-gray-900/60 to-black/50 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all"
        />
      </div>

      {/* Bouton TRIER avec animation de morphing */}
      <div ref={menuRef} className="relative z-50 min-h-10 w-10 isolate">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`
            cursor-pointer overflow-hidden
            bg-gradient-to-br from-black/70 via-gray-900/80 to-black/75
            border border-white/20
            shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.4)]
            transition-all duration-300 ease-out
            absolute right-0 top-0
            [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]
            ${
              isOpen
                ? "w-32 h-auto rounded-xl p-2"
                : "w-10 h-10 rounded-lg p-2 hover:from-black/60 hover:via-gray-800/70 hover:to-black/65"
            }
          `}
        >
          {/* Contenu du bouton (icône menu) */}
          <div
            className={`transition-all duration-300 flex items-center justify-center h-6 ${
              isOpen ? "opacity-0 !h-0" : "opacity-100"
            }`}
          >
            <ListFilter className="h-4 w-4 text-white" />
          </div>

          {/* Contenu du menu déroulant */}
          <div
            className={`
              flex flex-col gap-1
              transition-all duration-300 ease-out
              ${
                isOpen
                  ? "opacity-100 max-h-40"
                  : "opacity-0 max-h-0 pointer-events-none"
              }
            `}
          >
            <div className="flex items-center gap-2 text-white/60 text-xs font-medium pb-1 border-b border-white/20 mb-1">
              <ListFilter className="h-3 w-3" />
              Trier par
            </div>

            {/* Bouton Date */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSortClick("date");
              }}
              className={`
                flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left
                transition-colors duration-150
                ${
                  sortBy === "date"
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Calendar className="h-4 w-4" />
              Date{" "}
              {sortBy === "date" &&
                (sortOrder === "asc" ? (
                  <ArrowUpAz className="h-5 w-5 ml-auto" strokeWidth={1.4} />
                ) : (
                  <ArrowDownAz className="h-5 w-5 ml-auto" strokeWidth={1.4} />
                ))}
            </button>

            {/* Bouton Lieu */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSortClick("location");
              }}
              className={`
                flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left
                transition-colors duration-150
                ${
                  sortBy === "location"
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <MapPin className="h-4 w-4" />
              Lieu
              {sortBy === "location" &&
                (sortOrder === "asc" ? (
                  <ArrowUpAz className="h-5 w-5 ml-auto" strokeWidth={1.4} />
                ) : (
                  <ArrowDownAz className="h-5 w-5 ml-auto" strokeWidth={1.4} />
                ))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
