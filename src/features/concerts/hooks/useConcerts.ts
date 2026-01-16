import { useState, useEffect } from 'react';
import type { TMResponse, TMEvent } from '../types/ticketmaster.types';

const BACKEND_URL = "http://localhost:8080"; // L'adresse de ton serveur Go

export const useConcerts = (artistName: string | undefined) => {
  const [concerts, setConcerts] = useState<TMEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistName) return;

    const fetchConcerts = async () => {
      setLoading(true);
      setError(null);
      setConcerts([]); // Reset avant la nouvelle recherche

      try {
        // Appel à TON backend Go
        const res = await fetch(`${BACKEND_URL}/api/concerts?artist=${encodeURIComponent(artistName)}`);
        
        if (!res.ok) throw new Error('Erreur lors de la récupération des concerts');
        
        const data: TMResponse = await res.json();
        
        // Ticketmaster renvoie "_embedded" seulement s'il y a des résultats
        setConcerts(data._embedded?.events || []);
        
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les concerts");
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, [artistName]);

  return { concerts, loading, error };
};
