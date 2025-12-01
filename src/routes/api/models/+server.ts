import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient, listFiles, PUBLIC_BUCKET, getUserBucket } from '$lib/server/minio';
import { prisma } from '$lib/server/prisma';

interface Model3D {
	id: string;
	title: string;
	subtitle: string;
	content: string;
	image: string;
	category: string;
	downloads: number;
	rating: number;
	modelPath: string;
	plyPath?: string;
	bucketName: string;
	owner?: string;
	isPublic: boolean;
	likes?: number;
	isLiked?: boolean;
}

/**
 * Récupère la liste des modèles 3D depuis le bucket public et le bucket privé de l'utilisateur connecté
 */
export const GET: RequestHandler = async ({ locals }) => {
	console.log('🔍 GET /api/models appelé');
	try {
		// Déterminer quels buckets afficher
		const bucketsToLoad: string[] = [PUBLIC_BUCKET]; // Toujours inclure le bucket public
		
		// Si l'utilisateur est connecté, ajouter son bucket privé
		if (locals.user) {
			console.log(`👤 Utilisateur connecté: ${locals.user.id} (${locals.user.username})`);
			const userBucket = await getUserBucket(locals.user.id);
			if (userBucket) {
				console.log(`✅ Bucket utilisateur trouvé: ${userBucket}`);
				bucketsToLoad.push(userBucket);
			} else {
				console.log(`⚠️  Aucun bucket trouvé pour l'utilisateur ${locals.user.id}`);
			}
		} else {
			console.log(`👤 Aucun utilisateur connecté`);
		}

		console.log(`📦 Chargement des modèles depuis ${bucketsToLoad.length} buckets: ${bucketsToLoad.join(', ')}`);

		const allModels: Model3D[] = [];

		// Process buckets in parallel for better performance
		const bucketResults = await Promise.all(
			bucketsToLoad.map(async (bucketName) => {
				try {
					const files = await listFiles(bucketName);
					return { bucketName, files, error: null };
				} catch (error) {
					console.log(`⚠️  Le bucket ${bucketName} n'existe pas ou erreur: ${error}`);
					return { bucketName, files: [], error };
				}
			})
		);

		// Process results from each bucket
		for (const { bucketName, files, error } of bucketResults) {
			if (error || files.length === 0) {
				continue;
			}

			try {
				console.log(`📁 Bucket ${bucketName}: ${files.length} fichiers trouvés`);
				
				// Regrouper les fichiers par dossier (modèle)
				const modelMap = new Map<string, any>();

				for (const file of files) {
					if (!file.name) continue;

					const parts = file.name.split('/');
					if (parts.length < 2) {
						console.log(`⚠️  Fichier ignoré (pas dans un dossier): ${file.name}`);
						continue;
					}

					const modelFolder = parts[0];
					const fileName = parts[parts.length - 1];
					const fileExt = fileName.split('.').pop()?.toLowerCase();

					const modelKey = `${bucketName}/${modelFolder}`;

					if (!modelMap.has(modelKey)) {
						modelMap.set(modelKey, {
							id: modelKey,
							title: formatTitle(modelFolder),
							subtitle: 'Modèle 3D',
							content: `Modèle 3D ${formatTitle(modelFolder)}`,
							category: 'Modèles 3D',
							downloads: Math.floor(Math.random() * 3000) + 100,
							rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
							bucketName: bucketName,
							owner: bucketName,
							isPublic: bucketName === PUBLIC_BUCKET,
							files: []
						});
					}

					const model = modelMap.get(modelKey);
					model.files.push({ name: fileName, ext: fileExt, fullPath: file.name });

					// Définir les chemins selon le type de fichier
					if (fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'png' || fileExt === 'webp') {
						model.image = `/api/models/file?bucket=${encodeURIComponent(bucketName)}&path=${encodeURIComponent(file.name)}`;
					} else if (fileExt === 'glb' || fileExt === 'gltf') {
						model.modelPath = `/api/models/file?bucket=${encodeURIComponent(bucketName)}&path=${encodeURIComponent(file.name)}`;
					} else if (fileExt === 'ply') {
						// Pour les fichiers PLY, on utilise aussi modelPath pour l'affichage
						model.modelPath = `/api/models/file?bucket=${encodeURIComponent(bucketName)}&path=${encodeURIComponent(file.name)}`;
						model.plyPath = `/api/models/file?bucket=${encodeURIComponent(bucketName)}&path=${encodeURIComponent(file.name)}`;
					} else if (fileExt === 'obj') {
						model.modelPath = `/api/models/file?bucket=${encodeURIComponent(bucketName)}&path=${encodeURIComponent(file.name)}`;
					}
				}

				// Ajouter les modèles de ce bucket
				const bucketModels = Array.from(modelMap.values())
					.filter(model => {
						const hasModel = model.modelPath || model.plyPath;
						if (!hasModel) {
							console.log(`⚠️  Modèle ignoré (pas de fichier 3D): ${model.id} - fichiers: ${model.files.map((f: any) => f.name).join(', ')}`);
						}
						return hasModel;
					}) // Garder les modèles avec un fichier 3D (glb, gltf ou ply)
					.map(model => {
						// Nettoyer l'objet
						const { files, ...cleanModel } = model;
						return cleanModel;
					});

				console.log(`✅ Bucket ${bucketName}: ${bucketModels.length} modèles valides`);
				
				// Récupérer les likes pour tous les modèles de ce bucket
				let modelsWithLikes = bucketModels;
				
				try {
					const modelIds = bucketModels.map(m => m.id);
					// @ts-ignore - Le modèle ModelLike sera disponible après la génération du client Prisma
					const likes = await prisma.modelLike.findMany({
						where: {
							modelId: { in: modelIds }
						}
					});

					// Créer un map des likes par modèle
					const likesByModel = new Map<string, number>();
					const userLikes = new Set<string>();
					
					for (const like of likes) {
						const count = likesByModel.get(like.modelId) || 0;
						likesByModel.set(like.modelId, count + 1);
						
						// Vérifier si l'utilisateur connecté a liké ce modèle
						if (locals.user && like.userId === locals.user.id) {
							userLikes.add(like.modelId);
						}
					}

					// Ajouter les informations de likes aux modèles
					modelsWithLikes = bucketModels.map(model => ({
						...model,
						likes: likesByModel.get(model.id) || 0,
						isLiked: userLikes.has(model.id)
					}));
				} catch (error) {
					// Si la table ModelLike n'existe pas encore, ajouter des valeurs par défaut
					console.warn('⚠️  Impossible de charger les likes (table peut-être non créée):', error);
					modelsWithLikes = bucketModels.map(model => ({
						...model,
						likes: 0,
						isLiked: false
					}));
				}

				allModels.push(...modelsWithLikes);
			} catch (error) {
				console.error(`⚠️  Erreur lors de la lecture du bucket ${bucketName}:`, error);
				// Continuer avec les autres buckets
			}
		}

		console.log(`✅ ${allModels.length} modèles trouvés au total (${allModels.filter(m => m.isPublic).length} publics, ${allModels.filter(m => !m.isPublic).length} privés)`);
		return json({ success: true, models: allModels });
	} catch (error) {
		console.error('❌ Erreur lors de la récupération des modèles:', error);
		return json({ error: 'Erreur lors de la récupération des modèles' }, { status: 500 });
	}
};

/**
 * Formate le nom du dossier en titre lisible
 */
function formatTitle(folderName: string): string {
	return folderName
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
