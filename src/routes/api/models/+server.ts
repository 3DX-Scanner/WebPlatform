import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient, listFiles } from '$lib/server/minio';

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
 * Récupère la liste des modèles 3D depuis tous les buckets MinIO
 */
export const GET: RequestHandler = async () => {
	try {
		// Lister tous les buckets
		const buckets = await minioClient.listBuckets();
		console.log(`📦 ${buckets.length} buckets trouvés`);

		const allModels: Model3D[] = [];

		// Pour chaque bucket, lister les modèles
		for (const bucket of buckets) {
			try {
				const files = await listFiles(bucket.name);
				
				// Regrouper les fichiers par dossier (modèle)
				const modelMap = new Map<string, any>();

				for (const file of files) {
					if (!file.name) continue;

					const parts = file.name.split('/');
					if (parts.length < 2) continue;

					const modelFolder = parts[0];
					const fileName = parts[parts.length - 1];
					const fileExt = fileName.split('.').pop()?.toLowerCase();

					const modelKey = `${bucket.name}/${modelFolder}`;

					if (!modelMap.has(modelKey)) {
						modelMap.set(modelKey, {
							id: modelKey,
							title: formatTitle(modelFolder),
							subtitle: 'Modèle 3D',
							content: `Modèle 3D ${formatTitle(modelFolder)}`,
							category: 'Modèles 3D',
							downloads: Math.floor(Math.random() * 3000) + 100,
							rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
							bucketName: bucket.name,
							owner: bucket.name,
							files: []
						});
					}

					const model = modelMap.get(modelKey);
					model.files.push({ name: fileName, ext: fileExt, fullPath: file.name });

					// Définir les chemins selon le type de fichier
					if (fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'png' || fileExt === 'webp') {
						model.image = `/api/models/file?bucket=${encodeURIComponent(bucket.name)}&path=${encodeURIComponent(file.name)}`;
					} else if (fileExt === 'glb' || fileExt === 'gltf') {
						model.modelPath = `/api/models/file?bucket=${encodeURIComponent(bucket.name)}&path=${encodeURIComponent(file.name)}`;
					} else if (fileExt === 'ply') {
						model.plyPath = `/api/models/file?bucket=${encodeURIComponent(bucket.name)}&path=${encodeURIComponent(file.name)}`;
					}
				}

				// Ajouter les modèles de ce bucket
				const bucketModels = Array.from(modelMap.values())
					.filter(model => model.modelPath) // Garder uniquement les modèles avec un fichier 3D
					.map(model => {
						// Nettoyer l'objet
						const { files, ...cleanModel } = model;
						return cleanModel;
					});

				allModels.push(...bucketModels);
			} catch (error) {
				console.error(`⚠️  Erreur lors de la lecture du bucket ${bucket.name}:`, error);
				// Continuer avec les autres buckets
			}
		}

		console.log(`✅ ${allModels.length} modèles trouvés au total`);
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
