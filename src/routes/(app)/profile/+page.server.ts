import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }
    
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
            hasPassword: userFromDb.password !== '' 
        }
    };
};