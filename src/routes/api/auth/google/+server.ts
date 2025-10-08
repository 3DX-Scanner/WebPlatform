import { redirect } from '@sveltejs/kit';
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
	
	const params = new URLSearchParams({
		client_id: GOOGLE_CLIENT_ID,
		redirect_uri: GOOGLE_REDIRECT_URI,
		response_type: 'code',
		scope: 'email profile',
		access_type: 'offline',
		prompt: 'consent'
	});

	throw redirect(302, `${googleAuthUrl}?${params.toString()}`);
};
