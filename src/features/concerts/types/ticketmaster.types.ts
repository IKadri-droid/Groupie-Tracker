export interface TMVenue {
  name: string;
  city: {
    name: string;
  };
}

export interface TMEvent {
  id: string;
  name: string;
  url: string; // Lien vers la billetterie
  dates: {
    start: {
      localDate: string; // Format YYYY-MM-DD
    };
  };
  _embedded?: {
    venues?: TMVenue[];
  };
}

export interface TMResponse {
  _embedded?: {
    events: TMEvent[];
  };
}
