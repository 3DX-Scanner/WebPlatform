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
		const { modelId } = await request.json();

		if (!modelId || typeof modelId !== 'string') {
			return json({ error: 'modelId est requis' }, { status: 400 });
		}

		// @ts-ignore - Le modèle ModelLike sera disponible après la génération du client Prisma
		// Vérifier si le like existe déjà
		const existingLike = await prisma.modelLike.findUnique({
			where: {
				userId_modelId: {
					userId: locals.user.id,
					modelId: modelId
				}
			}
		});

		if (existingLike) {
			return json({ error: 'Le modèle est déjà liké' }, { status: 400 });
		}

		// Créer le like
		// @ts-ignore
		const like = await prisma.modelLike.create({
			data: {
				userId: locals.user.id,
				modelId: modelId
			}
		});

		// Compter le nombre total de likes pour ce modèle
		// @ts-ignore
		const likeCount = await prisma.modelLike.count({
			where: { modelId: modelId }
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
		// @ts-ignore
		await prisma.modelLike.deleteMany({
			where: {
				userId: locals.user.id,
				modelId: modelId
			}
		});

		// Compter le nombre total de likes pour ce modèle
		// @ts-ignore
		const likeCount = await prisma.modelLike.count({
			where: { modelId: modelId }
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

