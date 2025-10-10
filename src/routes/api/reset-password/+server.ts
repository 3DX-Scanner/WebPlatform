import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

export const GET = async ({ url }) => {
	try {
		const token = url.searchParams.get('token');
		if (!token) return json({ error: 'Token manquant.' }, { status: 400 });

		let payload: any;
		try {
			payload = jwt.verify(token, JWT_SECRET);
		} catch {
			return json({ error: 'Lien invalide ou expiré.' }, { status: 401 });
		}

		const { id, newPassword } = payload;

		// Hash du mot de passe
		const hashed = await bcrypt.hash(newPassword, 10);

		await prisma.user.update({
			where: { id },
			data: { password: hashed }
		});

		return json({
			success: true,
			newPassword
		});
	} catch (err) {
		console.error('Erreur reset-password:', err);
		return json({ error: 'Erreur interne du serveur.' }, { status: 500 });
	}
};
