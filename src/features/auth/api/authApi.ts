// Auth API functions
import type { LoginCredentials, LoginResponse } from '../types/auth.types'

const API_BASE_URL = 'http://localhost:8080/api'

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Erreur de connexion')
    }

    return response.json()
}
