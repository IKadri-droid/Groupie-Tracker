// Deezer API response types
export interface DeezerArtist {
  id: number;
  name: string;
  picture: string;
  picture_medium: string;
  picture_big: string;
}

export interface DeezerAlbum {
  id: number;
  title: string;
  cover: string;
  cover_medium: string;
  cover_big: string;
  release_date: string;
}

export interface DeezerTrack {
  id: number;
  title: string;
  preview: string; // URL du preview audio (30s)
  duration: number;
}
