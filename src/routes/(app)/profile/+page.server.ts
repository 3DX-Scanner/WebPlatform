import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }
    
    // Récupérer l'utilisateur depuis la DB pour vérifier s'il a un mot de passe
    const userFromDb = await prisma.user.findUnique({
        where: { id: locals.user.id },
        select: { id: true, email: true, username: true, password: true, createdAt: true }
    });
    
    if (!userFromDb) {
        throw redirect(302, '/login');
    }
    
    return {
        user: {
            ...locals.user,
            hasPassword: userFromDb.password !== '' // true si compte classique, false si Google OAuth
        }
    };
};