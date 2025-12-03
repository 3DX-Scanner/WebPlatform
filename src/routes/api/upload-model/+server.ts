import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadFile, getUserBucket, ensureUserBucket } from '$lib/server/minio';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		return json({ error: 'Non authentifié' }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const folderName = formData.get('folderName') as string;
		const imageFile = formData.get('image') as File;
		const modelFile = formData.get('model') as File;

		if (!folderName || !folderName.trim()) {
			return json({ error: 'Le nom du dossier est requis' }, { status: 400 });
		}

		if (!imageFile) {
			return json({ error: 'L\'image est requise' }, { status: 400 });
		}

		if (!modelFile) {
			return json({ error: 'Le fichier 3D est requis' }, { status: 400 });
		}

		// Sanitizer le nom du dossier (supprimer les caractères spéciaux)
		const sanitizedFolderName = folderName
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9-]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '');

		if (!sanitizedFolderName || sanitizedFolderName.length < 1) {
			return json({ error: 'Le nom du dossier n\'est pas valide' }, { status: 400 });
		}

		// Récupérer ou créer le bucket de l'utilisateur
		let bucketName = await getUserBucket(locals.user.id);
		if (!bucketName) {
			const user = await prisma.user.findUnique({
				where: { id: locals.user.id },
				select: { username: true }
			});
			if (user) {
				bucketName = await ensureUserBucket(locals.user.id, user.username);
				await prisma.user.update({
					where: { id: locals.user.id },
					data: { bucketName: bucketName } as { bucketName: string }
				});
			} else {
				return json({ error: 'Utilisateur introuvable' }, { status: 404 });
			}
		}

		// Validation des types de fichiers
		const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		if (!imageTypes.includes(imageFile.type)) {
			return json({ error: 'L\'image doit être au format JPEG, PNG ou WebP' }, { status: 400 });
		}

		const modelExtensions = ['.blend1', '.x3d', '.blend', '.glb', '.gltf', '.ply', '.stl', '.obj', '.usdc', '.svg', '.mtl', '.fbx', '.dae', '.abc'];
		const modelExtension = '.' + modelFile.name.split('.').pop()?.toLowerCase();
		if (!modelExtensions.includes(modelExtension)) {
			return json({ error: 'Le fichier 3D doit être au format BLEND, BLEND1, X3D, GLB, GLTF, PLY, STL, OBJ, USDC, SVG, MTL, FBX, DAE ou ABC' }, { status: 400 });
		}

		// Validation de la taille (max 100MB par fichier)
		const maxSize = 100 * 1024 * 1024; // 100MB
		if (imageFile.size > maxSize) {
			return json({ error: 'L\'image est trop volumineuse (max 100MB)' }, { status: 400 });
		}
		if (modelFile.size > maxSize) {
			return json({ error: 'Le fichier 3D est trop volumineux (max 100MB)' }, { status: 400 });
		}

		// Vérifier la limite de stockage du plan de l'utilisateur
		let storageLimitBytes = 1024 * 1024 * 1024; // Par défaut 1 Go (plan gratuit)
		
		try {
			const subscription = await prisma.subscription.findUnique({
				where: { userId: locals.user.id },
				include: {
					plan: true
				}
			});
			
			if (subscription && subscription.isActive) {
				// Convertir la limite de stockage de MB en bytes
				storageLimitBytes = Number(subscription.plan.storageLimit) * 1024 * 1024;
			}
		} catch (error) {
			console.warn('⚠️  Impossible de récupérer l\'abonnement:', error);
		}

		// Calculer le stockage utilisé actuel
		const { listFiles } = await import('$lib/server/minio');
		const existingFiles = await listFiles(bucketName);
		let totalStorageUsed = 0;
		for (const file of existingFiles) {
			totalStorageUsed += file.size || 0;
		}

		// Vérifier si l'upload dépasserait la limite
		const totalAfterUpload = totalStorageUsed + imageFile.size + modelFile.size;
		if (totalAfterUpload > storageLimitBytes) {
			const storageLimitMB = storageLimitBytes / (1024 * 1024);
			const usedMB = (totalStorageUsed / (1024 * 1024)).toFixed(2);
			return json({ 
				error: `Limite de stockage atteinte. Vous utilisez ${usedMB} MB sur ${storageLimitMB} MB disponibles. Veuillez passer à un plan supérieur.` 
			}, { status: 403 });
		}

		// Préparer les noms de fichiers avec le préfixe du dossier
		const sanitizeFileName = (fileName: string) => {
			return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
		};

		const imageObjectName = `${sanitizedFolderName}/${sanitizeFileName(imageFile.name)}`;
		const modelObjectName = `${sanitizedFolderName}/${sanitizeFileName(modelFile.name)}`;

		// Convertir les fichiers en Buffer
		const imageArrayBuffer = await imageFile.arrayBuffer();
		const imageBuffer = Buffer.from(imageArrayBuffer);

		const modelArrayBuffer = await modelFile.arrayBuffer();
		const modelBuffer = Buffer.from(modelArrayBuffer);

		// Fonction pour nettoyer les noms de fichiers pour les headers HTTP
		const sanitizeHeaderValue = (value: string): string => {
			// Garder seulement les caractères ASCII imprimables (32-126) et remplacer les autres
			return value
				.split('')
				.map(char => {
					const code = char.charCodeAt(0);
					// Caractères ASCII imprimables: 32-126
					if (code >= 32 && code <= 126) {
						// Exclure les caractères problématiques pour les headers
						if (char === '\r' || char === '\n' || char === '\t') {
							return '_';
						}
						return char;
					}
					return '_';
				})
				.join('');
		};

		// Métadonnées pour l'image
		const imageMetaData = {
			'Content-Type': imageFile.type,
			'Original-Name': sanitizeHeaderValue(imageFile.name),
			'Uploaded-By': sanitizeHeaderValue(locals.user.username),
			'User-Id': locals.user.id.toString(),
			'Folder-Name': sanitizeHeaderValue(sanitizedFolderName)
		};

		// Métadonnées pour le modèle 3D
		const modelMetaData = {
			'Content-Type': modelFile.type || 'application/octet-stream',
			'Original-Name': sanitizeHeaderValue(modelFile.name),
			'Uploaded-By': sanitizeHeaderValue(locals.user.username),
			'User-Id': locals.user.id.toString(),
			'Folder-Name': sanitizeHeaderValue(sanitizedFolderName)
		};

		// Upload des fichiers vers MinIO dans le dossier
		const imageResult = await uploadFile(
			bucketName,
			imageObjectName,
			imageBuffer,
			imageBuffer.length,
			imageMetaData
		);

		const modelResult = await uploadFile(
			bucketName,
			modelObjectName,
			modelBuffer,
			modelBuffer.length,
			modelMetaData
		);

		return json({
			success: true,
			folderName: sanitizedFolderName,
			image: {
				...imageResult,
				fileName: imageFile.name,
				size: imageFile.size
			},
			model: {
				...modelResult,
				fileName: modelFile.name,
				size: modelFile.size
			}
		});
	} catch (error: any) {
		console.error('❌ Erreur lors de l\'upload du modèle:', error);
		return json({ error: error.message || 'Erreur lors de l\'upload du modèle' }, { status: 500 });
	}
};

