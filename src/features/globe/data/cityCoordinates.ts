import citiesData from "./cities.json";

// Dictionnaire simple Ville -> Coordonnées
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = citiesData;

export const getCoordinates = (location: string) => {
  // Logique pour trouver les coordonnées ou retourner une position par défaut
  const locationLowerCase=location.toLowerCase()
  const cleanLocation=locationLowerCase.replace(/[-_]/g, ", ")
  return CITY_COORDINATES[cleanLocation] || { lat: 0, lng: 0 }; 
};