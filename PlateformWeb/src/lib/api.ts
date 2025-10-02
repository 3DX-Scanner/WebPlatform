// Fonctions API simples - juste des appels fetch

export interface User {
  id: number;
  email: string;
  name?: string;
  picture?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

// Connexion
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
}

// Inscription
export async function signup(email: string, password: string): Promise<AuthResponse> {
  console.log('Signup function called with:', { email });
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const result = await response.json();
  console.log('Signup response:', result);
  return result;
}

// Déconnexion
export async function logout(): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'DELETE',
  });
  return await response.json();
}

// Google OAuth
export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  return await response.json();
}

// Utilisateur actuel
export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await fetch('/api/auth/user', {
    method: 'GET',
  });
  return await response.json();
}
