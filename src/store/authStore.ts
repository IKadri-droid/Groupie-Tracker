import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
    user: string | null
    token: string | null
    setLogin: (user: string, token: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setLogin: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),
        }),
        {
            name: 'auth-storage', // Le nom de la clé dans le localStorage
        }
    )
)