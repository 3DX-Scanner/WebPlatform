import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Non authentifié' }, { status: 401 });
	}

	try {
		const { newUsername } = await request.json();

		if (!newUsername || typeof newUsername !== 'string') {
			return json({ error: 'Nom d\'utilisateur invalide' }, { status: 400 });
		}

		// Vérifier la longueur du username
		if (newUsername.length < 3 || newUsername.length > 30) {
			return json({ error: 'Le nom d\'utilisateur doit contenir entre 3 et 30 caractères' }, { status: 400 });
		}

		// Vérifier que le username contient uniquement des caractères alphanumériques, tirets et underscores
		const usernameRegex = /^[a-zA-Z0-9_-]+$/;
		if (!usernameRegex.test(newUsername)) {
			return json({ error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores' }, { status: 400 });
		}

		// Vérifier si le nouveau username est différent de l'actuel
		if (newUsername === locals.user.username) {
			return json({ error: 'Le nouveau nom d\'utilisateur est identique à l\'actuel' }, { status: 400 });
		}

		// Vérifier l'unicité du username
		const existingUser = await prisma.user.findUnique({
			where: { username: newUsername }
		});

		if (existingUser) {
			return json({ error: 'Ce nom d\'utilisateur est déjà utilisé' }, { status: 409 });
		}

		// Mettre à jour le username
		await prisma.user.update({
			where: { id: locals.user.id },
			data: { username: newUsername }
		});

		return json({ success: true, message: 'Nom d\'utilisateur modifié avec succès' });
	} catch (error) {
		console.error('Erreur lors du changement de nom d\'utilisateur:', error);
		return json({ error: 'Erreur serveur' }, { status: 500 });
	}
};
