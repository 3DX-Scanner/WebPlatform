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
		const fileInfos: { file: typeof files[0]; folderName: string; ext: string }[] = [];

		// First pass: collect file info and create model entries
		for (const file of files) {
			const parts = file.name.split('/');
			if (parts.length < 2) continue;

			const folderName = parts[0];
			const fileName = parts[parts.length - 1];
			const ext = fileName.split('.').pop()?.toLowerCase() || '';

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

			fileInfos.push({ file, folderName, ext });
		}

		// Generate all presigned URLs in parallel
		const presignedUrls = await Promise.all(
			fileInfos.map(({ file }) => getPresignedUrl(userBucket, file.name, 3600))
		);

		// Second pass: assign URLs to models
		for (let i = 0; i < fileInfos.length; i++) {
			const { folderName, ext } = fileInfos[i];
			const presignedUrl = presignedUrls[i];
			const model = modelMap.get(folderName);

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

		// Récupérer le nombre de modèles likés par l'utilisateur
		let likedModelsCount = 0;
		try {
			// @ts-ignore - Le modèle ModelLike sera disponible après la génération du client Prisma
			likedModelsCount = await prisma.modelLike.count({
				where: { userId: userId }
			});
		} catch (error) {
			console.warn('⚠️  Impossible de compter les likes (table peut-être non créée):', error);
		}

		const stats = {
			bucketName: userBucket,
			totalModels: userModels.length,
			likedModelsCount: likedModelsCount,
			storageUsed: totalStorageUsed,
			storageLimit: 1024 * 1024 * 1024, // 1 Go en bytes
			storageUsedMB: (totalStorageUsed / (1024 * 1024)).toFixed(2),
			storageLimitMB: 1024,
			storagePercentage: ((totalStorageUsed / (1024 * 1024 * 1024)) * 100).toFixed(1)
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
