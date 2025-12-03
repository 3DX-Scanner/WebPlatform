import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
    // Si l'utilisateur est déjà connecté, rediriger vers l'URL spécifiée ou /profile
    if (locals.user) {
        const redirectParam = url.searchParams.get('redirect');
        const redirectUrl = redirectParam ? decodeURIComponent(redirectParam) : '/profile';
        throw redirect(302, redirectUrl);
    }
    
    return {};
};
