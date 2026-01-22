export async function createCheckoutSession(concertId: number, token: string) {
    const response = await fetch("http://localhost:8080/api/create-checkout-session", {
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
