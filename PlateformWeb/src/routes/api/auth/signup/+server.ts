import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { hashPassword, createSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();
    console.log('Signup request received:', { email });

    if (!email || !password) {
      console.log('Validation failed: missing email or password');
      return json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    if (password.length < 6) {
      console.log('Validation failed: password too short');
      return json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 });
    }

    console.log('Checking for existing user...');
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('User already exists');
      return json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 409 });
    }

    console.log('Creating new user...');
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
      select: { id: true, email: true, createdAt: true }
    });

    console.log('User created successfully:', user);

    const sessionToken = createSession(user.id);
    cookies.set('session', sessionToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7
    });

    console.log('Session created, returning success');
    return json({ success: true, user });

  } catch (error) {
    console.error('Erreur signup détaillée:', error);
    console.error('Stack trace:', error.stack);
    return json({ error: 'Erreur lors de l\'inscription', details: error.message }, { status: 500 });
  }
};
