import Globe, { type GlobeMethods } from "react-globe.gl";
import type { Artist } from "@/features/artists";
import { getCoordinates } from "../data/cityCoordinates";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

interface ConcertGlobeProps {
  artists: Artist[]; // Je veux un tableau d'Artist
}

export default function ConcertGlobe({ artists }: ConcertGlobeProps) {
  // On utilise 'any' pour la ref car les types de react-globe peuvent être capricieux
  // ou GlobeMethods | undefined avec initialisation à undefined
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  //hover sur les pins

  const objectsMap = useRef(new Map<any, THREE.Group>());

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().enableZoom = false; //desactive le zoom
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5; //vitesse de rotation
      globeEl.current.pointOfView({
        lat: 30,
        lng: 10,
        altitude: 1.7,
      });
    }
  }, []);

  const pointsData = useMemo(() => {
    return artists
      .filter((artist) => artist.next_concert)
      .map((artist) => {
        const coords = getCoordinates(artist.next_concert!);
        return {
          lat: coords.lat,
          lng: coords.lng,
          label: `${artist.name} - ${artist.next_concert}`,
          color: artist.color || "red", // Rouge par défaut comme un pin
          size: 0.5,
        };
      });
  }, [artists]);

  return (
    <div className="h-[1000px] w-full flex items-center justify-center overflow-hidden">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
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
        onGlobeReady={() => {}}
      />
    </div>
  );
}

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
