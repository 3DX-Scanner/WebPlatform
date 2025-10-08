import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST({ request }) {
	try {
		const { email, password, username } = await request.json();

		if (!email || !password || !username) {
			return json({ error: 'Tous les champs sont obligatoires' }, { status: 400 });
		}

		// Vérifier si l'email est déjà utilisé
		const existingEmai = await prisma.user.findUnique({ where: { email } });
		if (existingEmai) {
			return json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
		}

		// Vérifier si le nom d'utilisateur est déjà utilisé
		const existingUsername = await prisma.user.findUnique({ where: { username } });
		if (existingUsername) {
			return json({ error: 'Ce nom d\'utilisateur est déjà utilisé' }, { status: 409 });
		}

		// Hash du mot de passe
		const hashedPassword = await bcrypt.hash(password, 10);

		// Création de l'utilisateur
		const newUser = await prisma.user.create({
			data: {
				email,
				username,
				password: hashedPassword
			}
		});

		return json({ message: 'Utilisateur créé', user: { id: newUser.id, email, username } });
	} catch (error) {
		console.error(error);
		return json({ error: 'Erreur interne' }, { status: 500 });
	}
}