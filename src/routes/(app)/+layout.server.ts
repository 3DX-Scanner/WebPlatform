import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
    depends('auth:session');
    return {
        isAuthenticated: Boolean(locals.user)
    };
};


