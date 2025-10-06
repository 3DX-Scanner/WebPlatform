import { json, redirect } from '@sveltejs/kit';

export async function POST({ cookies }) {
	cookies.set('jwt', '', {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 0
	});
	return json({ success: true });
}