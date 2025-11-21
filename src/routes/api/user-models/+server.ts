import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient, listFiles, getPresignedUrl, getUserBucket } from '$lib/server/minio';
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
}

/**
 * Récupère la liste des modèles 3D de l'utilisateur connecté
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		// Vérifier que l'utilisateur est connecté
		if (!locals.user) {
			return json({ error: 'Non authentifié' }, { status: 401 });
		}

		const userId = locals.user.id;
		
		// Récupérer le bucketName de l'utilisateur depuis la BDD
		const userBucket = await getUserBucket(userId);
		if (!userBucket) {
			console.log(`❌ Aucun bucket trouvé pour l'utilisateur ${userId}`);
			return json({ success: true, models: [] });
		}

		// Vérifier si le bucket existe dans MinIO
		const bucketExists = await minioClient.bucketExists(userBucket);
		if (!bucketExists) {
			console.log(`❌ Bucket ${userBucket} n'existe pas dans MinIO`);
			return json({ success: true, models: [] });
		}

		console.log(`📦 Récupération des modèles du bucket: ${userBucket}`);

		// Lister les fichiers du bucket utilisateur
		const files = await listFiles(userBucket);

		// Regrouper les fichiers par dossier (modèle)
		const modelMap = new Map<string, any>();

		for (const file of files) {
			const parts = file.name.split('/');
			if (parts.length < 2) continue;

			const folderName = parts[0];
			const fileName = parts[parts.length - 1];
			const ext = fileName.split('.').pop()?.toLowerCase();

			if (!modelMap.has(folderName)) {
				modelMap.set(folderName, {
					id: folderName,
					title: formatTitle(folderName),
					subtitle: 'Modèle personnel',
					content: 'Votre modèle 3D',
					category: 'Personnel',
					downloads: 0,
					rating: 5,
					modelPath: '',
					plyPath: '',
					image: '',
					bucketName: userBucket,
					owner: locals.user.username
				});
			}

			const model = modelMap.get(folderName);

			// Générer une URL présignée pour accéder au fichier privé (valide 1 heure)
			const presignedUrl = await getPresignedUrl(userBucket, file.name, 3600);

			if (ext === 'glb' || ext === 'gltf') {
				model.modelPath = presignedUrl;
			} else if (ext === 'ply') {
				model.plyPath = presignedUrl;
			} else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp') {
				model.image = presignedUrl;
			}
		}

		// Filtrer les modèles qui ont au moins un fichier 3D
		const userModels = Array.from(modelMap.values())
			.filter(model => model.modelPath || model.plyPath)
			.map(model => {
				// Utiliser une image par défaut si aucune image n'est trouvée
				if (!model.image) {
					model.image = '/favicon.png';
				}
				return model;
			});

		// Calculer le stockage utilisé
		let totalStorageUsed = 0;
		for (const file of files) {
			totalStorageUsed += file.size || 0;
		}

		// Récupérer le nombre de modèles likés par l'utilisateur (seulement ceux avec liked = true)
		let likedModelsCount = 0;
		try {
			// @ts-ignore - Le modèle Model sera disponible après la génération du client Prisma
			likedModelsCount = await prisma.model.count({
				where: { 
					userId: userId,
					liked: true
				}
			});
		} catch (error) {
			console.warn('⚠️  Impossible de compter les likes (table peut-être non créée):', error);
		}

		// Récupérer l'abonnement de l'utilisateur pour obtenir la limite de stockage
		let storageLimitBytes = 1024 * 1024 * 1024; // Par défaut 1 Go (plan gratuit)
		let storageLimitMB = 1024;
		
		try {
			const subscription = await prisma.subscription.findUnique({
				where: { userId: userId },
				include: {
					plan: true
				}
			});
			
			if (subscription && subscription.isActive) {
				// Convertir la limite de stockage de MB en bytes
				storageLimitBytes = Number(subscription.plan.storageLimit) * 1024 * 1024;
				storageLimitMB = Number(subscription.plan.storageLimit);
			}
		} catch (error) {
			console.warn('⚠️  Impossible de récupérer l\'abonnement (utilisation de la limite par défaut):', error);
		}

		const storageUsedMB = totalStorageUsed / (1024 * 1024);
		const storageLimitGB = storageLimitMB / 1024;
		
		const stats = {
			bucketName: userBucket,
			totalModels: userModels.length,
			likedModelsCount: likedModelsCount,
			storageUsed: totalStorageUsed,
			storageLimit: storageLimitBytes,
			storageUsedMB: storageUsedMB,
			storageLimitMB: storageLimitMB,
			storageLimitGB: storageLimitGB,
			storagePercentage: ((totalStorageUsed / storageLimitBytes) * 100).toFixed(1)
		};

		console.log(`✅ ${userModels.length} modèles trouvés pour l'utilisateur ${userId}`);
		return json({ success: true, models: userModels, stats });
	} catch (error) {
		console.error('❌ Erreur lors de la récupération des modèles utilisateur:', error);
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
