import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getUserFromSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    const sessionToken = cookies.get('session');
    
    if (!sessionToken) {
      return json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await getUserFromSession(sessionToken);

    if (!user) {
      return json({ error: 'Session invalide ou expirée' }, { status: 401 });
    }

    return json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Erreur get user:', error);
    return json({ error: 'Erreur lors de la récupération des informations' }, { status: 500 });
  }
};
