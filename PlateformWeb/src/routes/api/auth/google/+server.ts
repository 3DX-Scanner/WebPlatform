import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { createSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return json({ error: 'Token Google requis' }, { status: 400 });
    }

    // Décoder le JWT de Google (simplifié - à sécuriser en production)
    const payload = JSON.parse(
      Buffer.from(credential.split('.')[1], 'base64').toString()
    );

    const { sub: googleId, email, name, picture } = payload;

    if (!email || !googleId) {
      return json({ error: 'Token Google invalide' }, { status: 400 });
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }]
      }
    });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, name, picture }
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          name,
          picture,
          password: null
        }
      });
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Erreur Google login:', error);
    return json({ error: 'Erreur lors de la connexion Google' }, { status: 500 });
  }
};
