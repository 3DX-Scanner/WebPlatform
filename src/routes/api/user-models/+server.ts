import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient, listFiles, getPresignedUrl } from '$lib/server/minio';

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
		const userBucket = `user-${userId}`;

		// Vérifier si le bucket de l'utilisateur existe
		const bucketExists = await minioClient.bucketExists(userBucket);
		if (!bucketExists) {
			console.log(`❌ Bucket ${userBucket} n'existe pas`);
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

			// Générer l'URL via l'API proxy
			const fileUrl = `/api/models/file?bucket=${encodeURIComponent(userBucket)}&path=${encodeURIComponent(file.name)}`;

			if (ext === 'glb' || ext === 'gltf') {
				model.modelPath = fileUrl;
			} else if (ext === 'ply') {
				model.plyPath = fileUrl;
			} else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp') {
				model.image = fileUrl;
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

		console.log(`✅ ${userModels.length} modèles trouvés pour l'utilisateur ${userId}`);
		return json({ success: true, models: userModels });
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
