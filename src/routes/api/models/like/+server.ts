import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

/**
 * API pour liker/unliker un modèle
 * POST: Ajouter un like
 * DELETE: Retirer un like
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Non authentifié' }, { status: 401 });
	}

	try {
		const { modelId: modelPath } = await request.json();

		if (!modelPath || typeof modelPath !== 'string') {
			return json({ error: 'modelId est requis' }, { status: 400 });
		}

		// Vérifier si le like existe déjà
		const existingLike = await prisma.userModel.findUnique({
			where: {
				userId_modelPath: {
					userId: locals.user.id,
					modelPath: modelPath
				}
			}
		});

		if (existingLike) {
			return json({ error: 'Le modèle est déjà liké' }, { status: 400 });
		}

		// Créer le like
		const like = await prisma.userModel.create({
			data: {
				userId: locals.user.id,
				modelPath: modelPath
			}
		});

		// Compter le nombre total de likes pour ce modèle
		const likeCount = await prisma.userModel.count({
			where: { modelPath: modelPath }
		});

		return json({ 
			success: true, 
			liked: true,
			likeCount: likeCount 
		});
	} catch (error: any) {
		console.error('❌ Erreur lors de l\'ajout du like:', error);
		return json({ error: error.message || 'Erreur lors de l\'ajout du like' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Non authentifié' }, { status: 401 });
	}

	try {
		const { modelId } = await request.json();

		if (!modelId || typeof modelId !== 'string') {
			return json({ error: 'modelId est requis' }, { status: 400 });
		}

		// Supprimer le like
		await prisma.userModel.deleteMany({
			where: {
				userId: locals.user.id,
				modelPath: modelId
			}
		});

		// Compter le nombre total de likes pour ce modèle
		const likeCount = await prisma.userModel.count({
			where: { modelPath: modelId }
		});

		return json({ 
			success: true, 
			liked: false,
			likeCount: likeCount 
		});
	} catch (error: any) {
		console.error('❌ Erreur lors de la suppression du like:', error);
		return json({ error: error.message || 'Erreur lors de la suppression du like' }, { status: 500 });
	}
};

