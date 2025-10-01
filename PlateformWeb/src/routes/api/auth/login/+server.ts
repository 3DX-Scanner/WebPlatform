import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { verifyPassword, createSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const sessionToken = createSession(user.id);
    cookies.set('session', sessionToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7
    });

    return json({
      success: true,
      user: { id: user.id, email: user.email, createdAt: user.createdAt }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    return json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ cookies }) => {
  cookies.delete('session', { path: '/' });
  return json({ success: true, message: 'Déconnexion réussie' });
};
