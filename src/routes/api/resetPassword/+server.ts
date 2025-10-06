import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		let token = cookies.get('jwt');

		if (!token) {
			return json({ error: 'Jeton manquant' }, { status: 401 });
		}

		let payload: any;
		try {
			payload = jwt.verify(token, JWT_SECRET);
		} catch (err) {
			return json({ error: 'Jeton invalide ou expiré' }, { status: 401 });
		}

		const { currentPassword, newPassword, confirmPassword } = await request.json();

		if (newPassword !== confirmPassword) {
			return json({ error: 'Les mots de passe ne correspondent pas.' }, { status: 400 });
		}

		if (newPassword.length < 8) {
			return json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
		}

		const user = await prisma.user.findUnique({
			where: { id: payload.id },
			select: { password: true }
		});

		if (!user || !user.password) {
			return json({ error: 'Utilisateur introuvable.' }, { status: 404 });
		}

		const isValid = await bcrypt.compare(currentPassword, user.password);
		if (!isValid) {
			return json({ error: 'Mot de passe actuel incorrect.' }, { status: 401 });
		}

		const hashed = await bcrypt.hash(newPassword, 10);

		await prisma.user.update({
			where: { id: payload.id },
			data: { password: hashed }
		});

		return json({ success: true, message: 'Mot de passe mis à jour avec succès.' });
	} catch (err) {
		console.error('Erreur changement de mot de passe:', err);
		return json({ error: 'Erreur interne du serveur.' }, { status: 500 });
	}
};
