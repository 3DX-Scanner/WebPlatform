import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient, listFiles, getUserBucket, uploadFile, copyFile } from '$lib/server/minio';

export const PUT: RequestHandler = async ({ request, locals }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		return json({ error: 'Non authentifié' }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const bucketName = formData.get('bucketName') as string;
		const oldFolderName = formData.get('oldFolderName') as string;
		const newFolderName = formData.get('newFolderName') as string;
		const imageFile = formData.get('image') as File | null;
		const modelFile = formData.get('model') as File | null;

		if (!bucketName || !oldFolderName || !newFolderName) {
			return json({ error: 'bucketName, oldFolderName et newFolderName sont requis' }, { status: 400 });
		}

		// Vérifier que l'utilisateur ne peut modifier que ses propres modèles
		const userBucket = await getUserBucket(locals.user.id);
		if (bucketName !== userBucket) {
			return json({ error: 'Vous ne pouvez modifier que vos propres modèles' }, { status: 403 });
		}

		// Sanitizer le nouveau nom du dossier
		const sanitizedNewFolderName = newFolderName
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9-]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '');

		if (!sanitizedNewFolderName || sanitizedNewFolderName.length < 1) {
			return json({ error: 'Le nom du dossier n\'est pas valide' }, { status: 400 });
		}

		// Lister tous les fichiers dans l'ancien dossier
		const oldPrefix = `${oldFolderName}/`;
		const oldFiles = await listFiles(bucketName, oldPrefix);

		if (oldFiles.length === 0) {
			return json({ error: 'Aucun fichier trouvé pour ce modèle' }, { status: 404 });
		}

		// Trouver les anciens fichiers (image et modèle 3D)
		const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
		const modelExtensions = ['.blend1', '.x3d', '.blend', '.glb', '.gltf', '.ply', '.stl', '.obj', '.usdc', '.svg', '.mtl', '.fbx', '.dae', '.abc'];
		
		let oldImageFile: any = null;
		let oldModelFile: any = null;

		for (const file of oldFiles) {
			const fileName = file.name.toLowerCase();
			const extension = '.' + fileName.split('.').pop();
			
			if (imageExtensions.includes(extension) && !oldImageFile) {
				oldImageFile = file;
			} else if (modelExtensions.includes(extension) && !oldModelFile) {
				oldModelFile = file;
			}
		}

		// Si le nom du dossier change, copier tous les fichiers vers le nouveau dossier
		if (sanitizedNewFolderName !== oldFolderName) {
			console.log(`📁 Renommage du dossier: ${oldFolderName} -> ${sanitizedNewFolderName}`);
			
			// Copier tous les fichiers vers le nouveau dossier
			for (const file of oldFiles) {
				const oldObjectName = file.name;
				const fileName = oldObjectName.split('/').pop();
				const newObjectName = `${sanitizedNewFolderName}/${fileName}`;
				
				await copyFile(bucketName, oldObjectName, bucketName, newObjectName);
			}

			// Supprimer l'ancien dossier
			const deletePromises = oldFiles.map(file => 
				minioClient.removeObject(bucketName, file.name)
			);
			await Promise.all(deletePromises);

			console.log(`✅ Dossier renommé: ${oldFolderName} -> ${sanitizedNewFolderName}`);
		}

		// Remplacer l'image si fournie
		if (imageFile) {
			const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
			if (!imageTypes.includes(imageFile.type)) {
				return json({ error: 'L\'image doit être au format JPEG, PNG ou WebP' }, { status: 400 });
			}

			// Supprimer toutes les anciennes images dans le dossier (actuel ou nouveau)
			const currentFolderName = sanitizedNewFolderName !== oldFolderName ? sanitizedNewFolderName : oldFolderName;
			const currentFiles = await listFiles(bucketName, `${currentFolderName}/`);
			const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
			
			for (const file of currentFiles) {
				const fileName = file.name.toLowerCase();
				const extension = '.' + fileName.split('.').pop();
				if (imageExtensions.includes(extension)) {
					try {
						await minioClient.removeObject(bucketName, file.name);
						console.log(`🗑️ Ancienne image supprimée: ${file.name}`);
					} catch (error) {
						console.warn('⚠️ Impossible de supprimer l\'ancienne image:', error);
					}
				}
			}

			// Uploader la nouvelle image
			const sanitizeFileName = (fileName: string) => {
				return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
			};
			const newImageName = `${sanitizedNewFolderName}/${sanitizeFileName(imageFile.name)}`;
			
			const imageArrayBuffer = await imageFile.arrayBuffer();
			const imageBuffer = Buffer.from(imageArrayBuffer);
			
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

			const imageMetaData = {
				'Content-Type': imageFile.type,
				'Original-Name': sanitizeHeaderValue(imageFile.name),
				'Uploaded-By': sanitizeHeaderValue(locals.user.username),
				'User-Id': locals.user.id.toString(),
				'Folder-Name': sanitizeHeaderValue(sanitizedNewFolderName)
			};

			await uploadFile(
				bucketName,
				newImageName,
				imageBuffer,
				imageBuffer.length,
				imageMetaData
			);

			console.log(`✅ Image remplacée: ${newImageName}`);
		}

		// Remplacer le fichier 3D si fourni
		if (modelFile) {
			const modelExtensions = ['.blend1', '.x3d', '.blend', '.glb', '.gltf', '.ply', '.stl', '.obj', '.usdc', '.svg', '.mtl', '.fbx', '.dae', '.abc'];
			const modelExtension = '.' + modelFile.name.split('.').pop()?.toLowerCase();
			if (!modelExtensions.includes(modelExtension)) {
				return json({ error: 'Le fichier 3D doit être au format BLEND, BLEND1, X3D, GLB, GLTF, PLY, STL, OBJ, USDC, SVG, MTL, FBX, DAE ou ABC' }, { status: 400 });
			}

			// Supprimer tous les anciens fichiers 3D dans le dossier (actuel ou nouveau)
			const currentFolderName = sanitizedNewFolderName !== oldFolderName ? sanitizedNewFolderName : oldFolderName;
			const currentFiles = await listFiles(bucketName, `${currentFolderName}/`);
			const modelExtensionsList = ['.blend1', '.x3d', '.blend', '.glb', '.gltf', '.ply', '.stl', '.obj', '.usdc', '.svg', '.mtl', '.fbx', '.dae', '.abc'];
			
			for (const file of currentFiles) {
				const fileName = file.name.toLowerCase();
				const extension = '.' + fileName.split('.').pop();
				if (modelExtensionsList.includes(extension)) {
					try {
						await minioClient.removeObject(bucketName, file.name);
						console.log(`🗑️ Ancien fichier 3D supprimé: ${file.name}`);
					} catch (error) {
						console.warn('⚠️ Impossible de supprimer l\'ancien fichier modèle:', error);
					}
				}
			}

			// Uploader le nouveau fichier modèle
			const sanitizeFileName = (fileName: string) => {
				return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
			};
			const newModelName = `${sanitizedNewFolderName}/${sanitizeFileName(modelFile.name)}`;
			
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
			
			const modelMetaData = {
				'Content-Type': modelFile.type || 'application/octet-stream',
				'Original-Name': sanitizeHeaderValue(modelFile.name),
				'Uploaded-By': sanitizeHeaderValue(locals.user.username),
				'User-Id': locals.user.id.toString(),
				'Folder-Name': sanitizeHeaderValue(sanitizedNewFolderName)
			};

			await uploadFile(
				bucketName,
				newModelName,
				modelBuffer,
				modelBuffer.length,
				modelMetaData
			);

			console.log(`✅ Fichier 3D remplacé: ${newModelName}`);
		}

		return json({ 
			success: true, 
			message: 'Modèle modifié avec succès',
			folderName: sanitizedNewFolderName
		});
	} catch (error: any) {
		console.error('❌ Erreur lors de la modification du modèle:', error);
		return json({ error: error.message || 'Erreur lors de la modification du modèle' }, { status: 500 });
	}
};

