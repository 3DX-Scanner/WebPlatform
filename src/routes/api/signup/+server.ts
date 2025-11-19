import { json, type RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { ensureUserBucket } from '$lib/server/minio';

export async function POST({ request, cookies }: RequestEvent) {
	try {
		const { email, password, username } = await request.json();

		if (!email || !password || !username) {
			return json({ error: 'Tous les champs sont obligatoires' }, { status: 400 });
		}

		// Vérifier si la combinaison email+username existe déjà (contrainte unique composite)
		const existingUser = await prisma.user.findFirst({ 
			where: { 
				AND: [
					{ email },
					{ username }
				]
			}
		});
		if (existingUser) {
			return json({ error: 'Un utilisateur avec cet email et ce nom d\'utilisateur existe déjà' }, { status: 409 });
		}

		// Vérifier si l'email existe déjà avec un autre username
		const existingEmail = await prisma.user.findFirst({ where: { email } });
		if (existingEmail) {
			return json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
		}

		// Vérifier si le username existe déjà avec un autre email
		const existingUsername = await prisma.user.findFirst({ where: { username } });
		if (existingUsername) {
			return json({ error: "Ce nom d'utilisateur est déjà utilisé" }, { status: 409 });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		// Créer l'utilisateur d'abord pour obtenir son ID
		const newUser = await prisma.user.create({
			data: { 
				email, 
				username, 
				password: hashedPassword
			}
		});

		// Créer le bucket MinIO pour l'utilisateur avec son ID et username
		const bucketName = await ensureUserBucket(newUser.id, newUser.username);
		
		// Mettre à jour l'utilisateur avec le nom du bucket
		await prisma.user.update({
			where: { id: newUser.id },
			data: { bucketName: bucketName } as { bucketName: string }
		});
		
		// Recharger l'utilisateur avec le bucketName
		const updatedUser = await prisma.user.findUnique({
			where: { id: newUser.id }
		});

	// 🎟️ Génération du JWT
	const token = jwt.sign(
		{
			id: updatedUser!.id,
			email: updatedUser!.email,
			username: updatedUser!.username,
			createdAt: updatedUser!.createdAt
		},
		JWT_SECRET,
		{ expiresIn: '7d' }
	);

	// 🍪 Enregistrement du token dans un cookie HTTP-only
	cookies.set('jwt', token, {
		httpOnly: true,
		secure: false, // mettre à true en prod
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 7 // 7 jours
	});

		return json({ message: 'Utilisateur créé avec succès' });
	} catch (error: any) {
		console.error('Erreur lors de l\'inscription:', error);
		
		// Gérer les erreurs Prisma spécifiques
		if (error?.code === 'P2002') {
			const target = error?.meta?.target || [];
			// Si c'est la contrainte unique composite [email, username]
			if (target.length === 2 && target.includes('email') && target.includes('username')) {
				return json({ error: 'Un utilisateur avec cet email et ce nom d\'utilisateur existe déjà' }, { status: 409 });
			}
			if (target.includes('email') && !target.includes('username')) {
				return json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
			}
			if (target.includes('username') && !target.includes('email')) {
				return json({ error: "Ce nom d'utilisateur est déjà utilisé" }, { status: 409 });
			}
			if (target.includes('bucketName')) {
				return json({ error: 'Erreur lors de la création du compte' }, { status: 500 });
			}
			return json({ error: 'Un utilisateur avec ces informations existe déjà' }, { status: 409 });
		}
		
		return json({ error: 'Erreur interne du serveur' }, { status: 500 });
	}
}
