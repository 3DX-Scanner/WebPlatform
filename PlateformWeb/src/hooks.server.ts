import type { Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('jwt');

	if (token) {
		try {
			const user = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; email: string };
			event.locals.user = user;
		} catch (err) {
			console.warn('JWT invalide');
			event.locals.user = undefined;
		}
	} else {
		event.locals.user = undefined;
	}

	return resolve(event);
};