import { writable } from 'svelte/store';
import { getCurrentUser } from '$lib/api';

export interface User {
    id: number;
    email: string;
    name?: string;
    createdAt: string;
}

export const user = writable<User | null>(null);
export const isAuthenticated = writable<boolean>(false);

export async function checkAuth() {
    try {
        const response = await getCurrentUser();
        if (response.success && response.user) {
            user.set(response.user);
            isAuthenticated.set(true);
            return true;
        } else {
            user.set(null);
            isAuthenticated.set(false);
            return false;
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        user.set(null);
        isAuthenticated.set(false);
        return false;
    }
}

// Fonction pour se déconnecter
export function logout() {
    user.set(null);
    isAuthenticated.set(false);
    // Ici on pourrait aussi appeler l'API de déconnexion
}
