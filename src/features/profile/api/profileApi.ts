
const API_BASE_URL = 'http://localhost:8080/api'

export interface OrderHistory {
  id: number;
  amount: number;
  status: string;
  location: string;
  date: string;
  venue: string;
  image_concert: string;
}

export async function getUserHistory(token: string): Promise<OrderHistory[]> {
  const response = await fetch(`${API_BASE_URL}/history`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de l\'historique');
  }

  return response.json();
}
