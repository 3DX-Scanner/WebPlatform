import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    // Si l'utilisateur est déjà connecté, rediriger vers /profile
    if (locals.user) {
        throw redirect(302, '/profile');
    }
    
    return {};
};
