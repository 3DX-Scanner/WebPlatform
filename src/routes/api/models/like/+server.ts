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

		// @ts-ignore - Le modèle Model sera disponible après la génération du client Prisma
		// Vérifier si le modèle existe déjà pour cet utilisateur
		const existingModel = await prisma.model.findUnique({
			where: {
				userId_modelPath: {
					userId: locals.user.id,
					modelPath: modelPath
				}
			}
		});

		if (existingModel) {
			// Si l'entrée existe déjà, mettre à jour le champ liked
			if (existingModel.liked) {
				return json({ error: 'Le modèle est déjà liké' }, { status: 400 });
			}
			// Mettre à jour liked à true
			await prisma.model.update({
				where: {
					userId_modelId: {
						userId: locals.user.id,
						modelId: modelId
					}
				},
				data: {
					liked: true
				}
			});
		} else {
			// Créer une nouvelle entrée avec liked = true
			await prisma.model.create({
				data: {
					userId: locals.user.id,
					modelId: modelId,
					liked: true
				}
			});
		}

		// Compter le nombre total de likes pour ce modèle (seulement ceux avec liked = true)
		// @ts-ignore
		const likeCount = await prisma.model.count({
			where: { 
				modelId: modelId,
				liked: true
			}
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

		// Mettre à jour le champ liked à false au lieu de supprimer
		// @ts-ignore
		const existingModel = await prisma.model.findUnique({
			where: {
				userId_modelId: {
					userId: locals.user.id,
					modelId: modelId
				}
			}
		});

		if (existingModel) {
			// Mettre à jour liked à false
			await prisma.model.update({
				where: {
					userId_modelId: {
						userId: locals.user.id,
						modelId: modelId
					}
				},
				data: {
					liked: false
				}
			});
		}

		// Compter le nombre total de likes pour ce modèle (seulement ceux avec liked = true)
		// @ts-ignore
		const likeCount = await prisma.model.count({
			where: { 
				modelId: modelId,
				liked: true
			}
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

