import Globe, { type GlobeMethods } from "react-globe.gl";
import {
  useMemo,
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import type { Artist, Concert } from "@/features/artists";

export interface ConcertGlobeHandle {
  flyTo: (lat: number, lng: number) => void;
}

interface ConcertGlobeProps {
  artists: Artist[]; // Je veux un tableau d'Artist
  onPointClick?: (artist: Artist, concertId: number) => void;
  selectedCoords?: { lat: number; lng: number } | null;
}

const ConcertGlobe = forwardRef<ConcertGlobeHandle, ConcertGlobeProps>(
  (props, ref) => {
    const { artists, onPointClick, selectedCoords } = props;
    // On utilise 'any' pour la ref car les types de react-globe peuvent être capricieux
    // ou GlobeMethods | undefined avec initialisation à undefined
    const globeEl = useRef<GlobeMethods | undefined>(undefined);
    //hover sur les pins

    const objectsMap = useRef(new Map<any, THREE.Group>());

    // Déclaration de dimensions et containerRef avant les useEffects
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({
      width: typeof window !== "undefined" ? window.innerWidth : 0,
      height:
        typeof window !== "undefined"
          ? window.innerWidth < 1024
            ? 500
            : 1000
          : 0,
    });

    useImperativeHandle(ref, () => ({
      flyTo: (lat: number, lng: number) => {
        if (globeEl.current) {
          globeEl.current.controls().autoRotate = false;
          globeEl.current.pointOfView({ lat, lng, altitude: 1.7 }, 2000);

          // Relancer la rotation après 3 secondes
          setTimeout(() => {
            if (globeEl.current) {
              globeEl.current.controls().autoRotate = true;
            }
          }, 30000);
        }
      },
    }));

    useEffect(() => {
      if (globeEl.current) {
        globeEl.current.controls().enableZoom = false; // Désactive le zoom avec la souris
        globeEl.current.controls().autoRotate = true;
        globeEl.current.controls().autoRotateSpeed = 0.5; // Vitesse de rotation

        // Définir l'altitude (zoom) en fonction de la largeur de l'écran
        let altitude = 1.7; // Desktop par défaut
        if (dimensions.width > 0) {
          if (dimensions.width < 768) {
            altitude = 2; // Mobile - on dézoome pour voir le globe entier sans couper l'atmosphère
          } else if (dimensions.width < 1024) {
            altitude = 2.2; // Tablette
          }
        }

        globeEl.current.pointOfView({
          lat: 30,
          lng: 10,
          altitude: altitude,
        });
      }
    }, [dimensions.width]);

    const pointsData = useMemo(() => {
      return artists.flatMap((artist) => {
        // 1. On vérifie si l'artiste a des concerts, sinon on retourne un tableau vide
        if (!artist.concerts) return [];

        // 2. On transforme CHAQUE concert de la liste en un point
        return artist.concerts.map((concert: Concert) => ({
          lat: concert.latitude, // Plus besoin de getCoordinates !
          lng: concert.longitude, // C'est direct dans l'objet concert maintenant
          label: `${artist.name} - ${concert.location}`,
          color:
            selectedCoords &&
            concert.latitude === selectedCoords.lat &&
            concert.longitude === selectedCoords.lng
              ? "#00ff00" // Vert pour le sélectionné
              : "red", // Rouge par défaut
          size: 0.5,
          artist: artist,
          concertId: concert.id,
        }));
      });
    }, [artists, selectedCoords]);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const obs = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      });
      obs.observe(el);
      return () => obs.disconnect();
    }, []);

    return (
      <div
        ref={containerRef}
        className="h-full w-full flex items-center justify-center overflow-hidden"
      >
        {dimensions.width > 0 && (
          <Globe
            ref={globeEl}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundColor="rgba(0,0,0,0)"
            // --- 3D OBJECTS ---
            objectsData={pointsData}
            objectLat="lat"
            objectLng="lng"
            objectAltitude={0}
            objectThreeObject={(d: any) => {
              // Création du groupe (pour combiner tige + boule)
              const group = new THREE.Group();

              group.rotation.x = Math.PI / 2;
              // 1. La tige (Cylindre gris)
              const poleGeometry = new THREE.CylinderGeometry(0.5, 0.2, 10, 8);
              const poleMaterial = new THREE.MeshLambertMaterial({
                color: 0xcccccc,
              });
              const pole = new THREE.Mesh(poleGeometry, poleMaterial);
              pole.position.y = 1.5; // On remonte la tige pour que la base soit au sol
              group.add(pole);

              // 2. La boule (Sphère colorée)
              const sphereGeometry = new THREE.SphereGeometry(1.5, 16, 16);
              const sphereMaterial = new THREE.MeshLambertMaterial({
                color: d.color,
              });
              const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
              sphere.position.y = 6 + 0.5; // Posée sur la tige
              group.add(sphere);

              objectsMap.current.set(d, group);

              group.scale.set(0.5, 0.5, 0.5);

              return group;
            }}
            onObjectHover={(obj: any, prevObj: any) => {
              // 3. On récupère le vrai Objet 3D via la Map
              const threeObj = objectsMap.current.get(obj);
              const prevThreeObj = objectsMap.current.get(prevObj);
              if (prevThreeObj) {
                // prevThreeObj.scale.set(0.5, 0.5, 0.5);
                animateScale(prevThreeObj, 0.5); // Animation fluide vers 0.5
              }

              if (threeObj) {
                // threeObj.scale.set(0.8, 0.8, 0.8);
                animateScale(threeObj, 0.8); // Animation fluide vers 0.8
              }

              document.body.style.cursor = obj ? "pointer" : "default";
            }}
            onObjectClick={(obj: any) => {
              if (onPointClick && obj.artist) {
                onPointClick(obj.artist, obj.concertId);
              }
            }}
            onGlobeReady={() => {}}
          />
        )}
      </div>
    );
  },
);

export default ConcertGlobe;

function animateScale(obj: THREE.Object3D, targetScale: number) {
  const startScale = obj.scale.x; // On suppose x=y=z
  const startTime = Date.now();
  const duration = 200; // ms

  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing simple (easeOutQuad)
    const ease = 1 - (1 - progress) * (1 - progress);

    const currentScale = startScale + (targetScale - startScale) * ease;
    obj.scale.set(currentScale, currentScale, currentScale);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
