// Auth API functions
import type { LoginCredentials, LoginResponse, RegisterResponse, RegisterCredentials } from '../types/auth.types'
import { API_BASE_URL } from '@/shared/config/api'

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

export async function registerUser(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
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