import { json } from '@sveltejs/kit';

export function GET({ locals }) {
    return json({ authenticated: Boolean(locals.user) });
}


