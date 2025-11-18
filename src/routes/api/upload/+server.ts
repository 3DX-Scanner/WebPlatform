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
		const file = formData.get('file') as File;
		
		// Récupérer ou créer le bucket de l'utilisateur
		let bucketName = await getUserBucket(locals.user.id);
		if (!bucketName) {
			// Si pas de bucket, récupérer le username et créer le bucket
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

		if (!file) {
			return json({ error: 'Aucun fichier fourni' }, { status: 400 });
		}

		// Validation du type de fichier
		const allowedTypes = [
			'model/gltf-binary',
			'model/gltf+json',
			'application/octet-stream', // Pour .glb, .ply
			'image/jpeg',
			'image/png',
			'image/jpg',
			'image/webp'
		];

		if (!allowedTypes.includes(file.type) && !file.name.match(/\.(glb|gltf|ply|obj|jpg|jpeg|png|webp)$/i)) {
			return json({ error: 'Type de fichier non autorisé' }, { status: 400 });
		}

		// Validation de la taille (max 100MB)
		const maxSize = 100 * 1024 * 1024; // 100MB
		if (file.size > maxSize) {
			return json({ error: 'Fichier trop volumineux (max 100MB)' }, { status: 400 });
		}

		// Générer un nom unique pour le fichier
		const timestamp = Date.now();
		const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
		const objectName = `${timestamp}_${sanitizedFileName}`;

		// Convertir le fichier en Buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Métadonnées
		const metaData = {
			'Content-Type': file.type,
			'Original-Name': file.name,
			'Uploaded-By': locals.user.username,
			'User-Id': locals.user.id.toString()
		};

		// Upload vers MinIO
		const result = await uploadFile(bucketName, objectName, buffer, buffer.length, metaData);

		return json({
			...result,
			fileName: file.name,
			size: file.size,
			type: file.type
		});
	} catch (error) {
		console.error('❌ Erreur lors de l\'upload:', error);
		return json({ error: 'Erreur lors de l\'upload du fichier' }, { status: 500 });
	}
};
