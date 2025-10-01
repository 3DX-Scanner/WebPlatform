import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// Hash un mot de passe
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Vérifie un mot de passe
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Crée une session simple
export function createSession(userId: number): string {
  return Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
}

// Vérifie une session
export function verifySession(sessionToken: string): { userId: number } | null {
  try {
    const decoded = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours
    if (Date.now() - decoded.timestamp > maxAge) return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

// Récupère l'utilisateur depuis la session
export async function getUserFromSession(sessionToken: string | undefined) {
  if (!sessionToken) return null;
  
  const session = verifySession(sessionToken);
  if (!session) return null;

  return await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, password: true }
  });
}
