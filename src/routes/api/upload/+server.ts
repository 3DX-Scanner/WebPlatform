import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadFile, getUserBucket, ensureUserBucket } from '$lib/server/minio';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request, locals }) => {
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
		const totalAfterUpload = totalStorageUsed + file.size;
		if (totalAfterUpload > storageLimitBytes) {
			const storageLimitMB = storageLimitBytes / (1024 * 1024);
			const usedMB = (totalStorageUsed / (1024 * 1024)).toFixed(2);
			return json({ 
				error: `Limite de stockage atteinte. Vous utilisez ${usedMB} MB sur ${storageLimitMB} MB disponibles. Veuillez passer à un plan supérieur.` 
			}, { status: 403 });
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
