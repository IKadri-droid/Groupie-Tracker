import {
  useEffect,
  useRef,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import type { Artist } from "../types/artist.types";
import ArtistCard from "./ArtistCard";

export interface CarouselHandle {
  scrollToArtist: (artistId: number) => void;
}

interface Carousel3DProps {
  artists: Artist[];
  onArtistClick?: (artist: Artist) => void;
  onHoverArtist?: (color: string | null) => void;
}

const Carousel3D = forwardRef<CarouselHandle, Carousel3DProps>(
  ({ artists, onArtistClick, onHoverArtist }, ref) => {
    const xTranslation = useMotionValue(0);

    // Dupliquer les cartes pour l'effet infini.
    // On en a besoin d'assez pour remplir l'écran au moins 2 fois pour le loop sans glitch.
    const displayArtists = useMemo(() => {
      if (artists.length === 0) return [];
      let result = [...artists];
      // S'assurer d'avoir au moins 10 cartes de base avant duplication
      while (result.length < 10) {
        result = [...result, ...artists];
      }
      // Double le tout pour le loop continu
      return [...result, ...result];
    }, [artists]);

    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(null);
    const xRef = useRef(0);
    const isPausedRef = useRef(false);

    const CARD_WIDTH = 280;
    const GAP = 0;
    const ITEM_SIZE = CARD_WIDTH + GAP;

    // Calculer la largeur de la moitié du set dupliqué pour le reset de position
    // displayArtists contient 2 sets identiques. La "boucle" se fait sur la moitié du total.
    const halfWidth = (displayArtists.length / 2) * ITEM_SIZE;

    useImperativeHandle(ref, () => ({
      scrollToArtist: (artistId: number) => {
        // Trouver tous les indices possibles pour cet artiste (duplication pour le loop infini)
        const allIndices: number[] = [];
        displayArtists.forEach((a, i) => {
          if (a.id === artistId) allIndices.push(i);
        });

        if (allIndices.length === 0) return;

        const containerWidth =
          containerRef.current?.offsetWidth || window.innerWidth;
        const centerOffset = containerWidth / 2 - ITEM_SIZE / 2;

        // On cherche l'indice qui demande le moins de déplacement par rapport à la position actuelle
        let bestIndex = allIndices[0];
        let minDistance = Math.abs(
          xRef.current - (centerOffset - allIndices[0] * ITEM_SIZE),
        );

        for (let i = 1; i < allIndices.length; i++) {
          const index = allIndices[i];
          const targetX = centerOffset - index * ITEM_SIZE;
          const distance = Math.abs(xRef.current - targetX);
          if (distance < minDistance) {
            minDistance = distance;
            bestIndex = index;
          }
        }

        const finalTargetX = centerOffset - bestIndex * ITEM_SIZE;

        isPausedRef.current = true; // Stop loop

        animate(xTranslation, finalTargetX, {
          duration: 1.5,
          ease: "easeInOut",
          onUpdate: (v) => {
            xRef.current = v;
          },
          onComplete: () => {
            setTimeout(() => {
              isPausedRef.current = false;
            }, 10000);
          },
        });
      },
    }));

    const animateScroll = () => {
      if (!isPausedRef.current) {
        // Respecter la pause programmatique
        xRef.current += 0.5; // Vitesse lente

        // Reset position pour loop infini
        if (xRef.current >= 0) {
          xRef.current = -halfWidth;
        }
        xTranslation.set(xRef.current);
      }
      requestRef.current = requestAnimationFrame(animateScroll);
    };

    useEffect(() => {
      requestRef.current = requestAnimationFrame(animateScroll);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
    }, [isHovered, halfWidth]);

    return (
      <div
        className="relative w-full h-[500px] flex items-center overflow-hidden perspective-container"
        ref={containerRef}
      >
        <motion.div
          className="flex absolute left-0 pl-10 h-full items-center"
          style={{ x: xTranslation, gap: GAP }}
        >
          {displayArtists.map((artist, idx) => (
            <motion.div
              key={`${artist.id}-${idx}`}
              className="relative flex-shrink-0"
              style={{
                width: CARD_WIDTH,
                height: 400,
                transformPerspective: 1000,
                willChange: "transform",
              }}
              initial={{ rotateY: 15, scale: 0.9 }}
              animate={{
                rotateY: 35,
                scale: 0.9,
                rotateX: 0,
                y: 0,
                zIndex: 0,
              }}
              whileHover={{
                rotateY: 0,
                rotateX: 0,
                scale: 1.05,
                y: -20,
                zIndex: 100,
                transition: { duration: 0.7, ease: "easeOut" },
              }}
              onHoverStart={() => {
                setIsHovered(true);
                if (onHoverArtist) onHoverArtist(artist.color ?? null);
              }}
              onHoverEnd={() => {
                setIsHovered(false);
                if (onHoverArtist) onHoverArtist(null);
              }}
            >
              <div className="w-full h-full transform-style-3d">
                <ArtistCard
                  artist={artist}
                  onClick={() => {
                    if (onArtistClick) onArtistClick(artist);
                  }}
                  disableHover={true}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  },
);

export default Carousel3D;
