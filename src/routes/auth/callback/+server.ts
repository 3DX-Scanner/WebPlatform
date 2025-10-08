import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import jwt from 'jsonwebtoken';
import { 
	GOOGLE_CLIENT_ID, 
	GOOGLE_CLIENT_SECRET, 
	GOOGLE_REDIRECT_URI, 
	JWT_SECRET 
} from '$env/static/private';

interface GoogleTokenResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
	scope: string;
	refresh_token?: string;
}

interface GoogleUserInfo {
	email: string;
	verified_email: boolean;
	name?: string;
	given_name?: string;
	family_name?: string;
	picture?: string;
}

/**
 * Génère un username unique en ajoutant un suffixe numérique si nécessaire
 */
async function generateUniqueUsername(baseUsername: string): Promise<string> {
	let username = baseUsername;
	let counter = 1;

	// Vérifier si le username existe déjà
	while (await prisma.user.findFirst({ where: { username } })) {
		username = `${baseUsername}${counter}`;
		counter++;
	}

	return username;
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error');

	// Si l'utilisateur refuse l'autorisation
	if (error) {
		console.error('Erreur OAuth:', error);
		throw redirect(302, '/login?error=access_denied');
	}

	if (!code) {
		throw redirect(302, '/login?error=no_code');
	}

	// 1️⃣ Échanger le code contre un access token
	const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			code,
			client_id: GOOGLE_CLIENT_ID,
			client_secret: GOOGLE_CLIENT_SECRET,
			redirect_uri: GOOGLE_REDIRECT_URI,
			grant_type: 'authorization_code'
		})
	});

	if (!tokenResponse.ok) {
		const errorData = await tokenResponse.text();
		console.error('Erreur lors de l\'échange de code:', errorData);
		throw redirect(302, '/login?error=token_exchange_failed');
	}

	const tokenData: GoogleTokenResponse = await tokenResponse.json();

	// 2️⃣ Récupérer les informations de l'utilisateur
	const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		headers: {
			Authorization: `Bearer ${tokenData.access_token}`
		}
	});

	if (!userInfoResponse.ok) {
		console.error('Erreur lors de la récupération des informations utilisateur');
		throw redirect(302, '/login?error=user_info_failed');
	}

	const userInfo: GoogleUserInfo = await userInfoResponse.json();

	// 3️⃣ Vérifier si l'email est vérifié
	if (!userInfo.verified_email) {
		throw redirect(302, '/login?error=email_not_verified');
	}

	// 4️⃣ Vérifier si l'utilisateur existe déjà
	let user = await prisma.user.findUnique({
		where: { email: userInfo.email }
	});

	// 5️⃣ Si l'utilisateur n'existe pas, le créer avec un username unique
	if (!user) {
		const baseUsername = userInfo.name || userInfo.email.split('@')[0];
		const uniqueUsername = await generateUniqueUsername(baseUsername);

		user = await prisma.user.create({
			data: {
				email: userInfo.email,
				username: uniqueUsername,
				password: '' // Pas de mot de passe pour les utilisateurs Google OAuth
			}
		});

		console.log(`✅ Nouvel utilisateur créé: ${userInfo.email} (username: ${uniqueUsername})`);
	} else {
		console.log(`✅ Utilisateur existant connecté: ${userInfo.email}`);
	}

	// 6️⃣ Générer un JWT
	const token = jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
			createdAt: user.createdAt
		},
		JWT_SECRET,
		{ expiresIn: '1h' }
	);

	// 7️⃣ Enregistrer le token dans un cookie
	cookies.set('jwt', token, {
		httpOnly: true,
		secure: false, // En dev, mettre à true en production
		sameSite: 'lax', // 'lax' permet le cookie lors de redirections, 'strict' bloque
		path: '/',
		maxAge: 60 * 60 // 1 heure
	});

	console.log('✅ Cookie JWT défini pour:', userInfo.email);
	console.log('✅ Authentification Google réussie, redirection vers /profile');

	// 8️⃣ Rediriger vers le profil
	throw redirect(302, '/profile');
};
