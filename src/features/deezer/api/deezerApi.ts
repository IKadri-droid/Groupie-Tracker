import { API_BASE_URL } from '@/shared/config/api';

/**
 * Search for an artist by name
 */
export async function searchArtist(name: string) {
  const response = await fetch(`${API_BASE_URL}/deezer/search?name=${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error('Failed to search artist');
  }
  return response.json();
}

/**
 * Get albums for an artist
 */
export async function getAlbums(artistID: number) {
  const response = await fetch(`${API_BASE_URL}/deezer/albums?artistID=${artistID}`);
  if (!response.ok) {
    throw new Error('Failed to get albums');
  }
  return response.json();
}

/**
 * Get top tracks for an artist
 */
export async function getTopTracks(artistID: number) {
  const response = await fetch(`${API_BASE_URL}/deezer/top-tracks?artistID=${artistID}`);
  if (!response.ok) {
    throw new Error('Failed to get top tracks');
  }
  return response.json();
}
