import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals, cookies }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const userFromDb = await prisma.user.findUnique({
        where: { id: locals.user.id },
        select: { id: true, email: true, username: true, password: true, createdAt: true }
    });

    if (!userFromDb) {
        // Clear invalid JWT cookie to prevent redirect loop
        cookies.delete('jwt', { path: '/' });
        throw redirect(302, '/login');
    }
    
    return {
        user: {
            id: userFromDb.id,
            email: userFromDb.email,
            username: userFromDb.username,
            createdAt: userFromDb.createdAt.toISOString(),
            hasPassword: userFromDb.password !== '' 
        }
    };
};