import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST({ request, cookies }) {
	try {
		const { email, password, username } = await request.json();

		if (!email || !password || !username) {
			return json({ error: 'Tous les champs sont obligatoires' }, { status: 400 });
		}

		const existingEmail = await prisma.user.findUnique({ where: { email } });
		if (existingEmail) {
			return json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
		}

		const existingUsername = await prisma.user.findUnique({ where: { username } });
		if (existingUsername) {
			return json({ error: "Ce nom d'utilisateur est déjà utilisé" }, { status: 409 });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await prisma.user.create({
			data: { email, username, password: hashedPassword }
		});

		// 🎟️ Génération du JWT
		const token = jwt.sign(
			{
				id: newUser.id,
				email: newUser.email,
				username: newUser.username,
				createdAt: newUser.createdAt
			},
			JWT_SECRET,
			{ expiresIn: '1h' }
		);

		// 🍪 Enregistrement du token dans un cookie HTTP-only
		cookies.set('jwt', token, {
			httpOnly: true,
			secure: false, // mettre à true en prod
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60
		});

		return json({ message: 'Utilisateur créé avec succès' });
	} catch (error) {
		console.error(error);
		return json({ error: 'Erreur interne' }, { status: 500 });
	}
}
