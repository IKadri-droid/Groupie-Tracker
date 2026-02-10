import { API_BASE_URL } from '@/shared/config/api';

export async function createCheckoutSession(concertId: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ concert_id: concertId }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to create checkout session");
    }

    return response.json(); // { url: "..." }
}
