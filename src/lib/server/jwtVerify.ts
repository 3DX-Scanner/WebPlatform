import jwt from 'jsonwebtoken';
import type { Cookies } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';

interface JwtPayload {
	id: string;
	email?: string;
	iat?: number;
	exp?: number;
}

export function verifyJwtFromCookies(cookies: Cookies): JwtPayload | null {
	const token = cookies.get('jwt');
	if (!token) return null;

	try {
		const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
		return payload;
	} catch (err) {
		console.error('Erreur de vérification du JWT :', err);
		return null;
	}
}
