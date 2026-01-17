// Auth types
export interface User {
    email: string
    // Tu pourras ajouter 'id', 'name', 'avatarUrl' plus tard ici !
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface LoginResponse {
    user: User
    token: string
}

export interface RegisterCredentials {
    email: string
    password: string
    username:string
}

export interface RegisterResponse {
    message:string
}
