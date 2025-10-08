import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

interface LoginRequest {
	email: string;
	password: string;
}

export async function POST({ request, cookies }) {
	try {
		const { email, password }: LoginRequest = await request.json();

		// 🔍 Recherche de l'utilisateur via Prisma
		const user = await prisma.user.findUnique({
			where: { email }
		});

		// 🔍 Vérification de l'existence de l'utilisateur
		if (!user) {
			return json({ error: 'Utilisateur introuvable' }, { status: 404 });
		}

		// 🔑 Vérification du mot de passe
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			return json({ error: 'Mot de passe incorrect' }, { status: 401 });
		}

		// 🎟️ Génération du JWT
		const token = jwt.sign(
		{ id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
		JWT_SECRET,
		{ expiresIn: '1h' }
		);

		// 🍪 Enregistrement du token dans un cookie HTTP-only
		cookies.set('jwt', token, {
			httpOnly: true,
			secure: false, // En dev, mettre à true en production
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 // 1 heure
		});

		return json({ success: true });
	} catch (err) {
		console.error('Erreur login :', err);
		return json({ error: 'Erreur interne du serveur' }, { status: 500 });
	}
}