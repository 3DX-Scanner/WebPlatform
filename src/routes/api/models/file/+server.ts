import type { RequestHandler } from './$types';
import { minioClient, getUserBucket, PUBLIC_BUCKET } from '$lib/server/minio';
import { prisma } from '$lib/server/prisma';

/**
 * Sert un fichier depuis MinIO
 * Pour les buckets privés, vérifie que l'utilisateur est le propriétaire
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const bucketName = url.searchParams.get('bucket');
		const filePath = url.searchParams.get('path');

		if (!bucketName || !filePath) {
			return new Response('Paramètres manquants (bucket et path requis)', { status: 400 });
		}

		// Si c'est le bucket public, autoriser l'accès
		if (bucketName === PUBLIC_BUCKET) {
			const dataStream = await minioClient.getObject(bucketName, filePath);
			return streamFileResponse(dataStream, filePath);
		}

		// Pour les buckets privés, vérifier que l'utilisateur est connecté et propriétaire
		if (!locals.user) {
			return new Response('Non authentifié', { status: 401 });
		}

		// Vérifier que le bucket appartient à l'utilisateur
		const userBucket = await getUserBucket(locals.user.id);
		if (bucketName !== userBucket) {
			// Vérifier dans la BDD si le bucket appartient à l'utilisateur
			const bucketOwner = await prisma.user.findFirst({
				where: { bucketName: bucketName },
				select: { id: true }
			});
			
			if (!bucketOwner || bucketOwner.id !== locals.user.id) {
				return new Response('Accès refusé', { status: 403 });
			}
		}

		// Récupérer le fichier depuis MinIO
		const dataStream = await minioClient.getObject(bucketName, filePath);
		return streamFileResponse(dataStream, filePath);

	} catch (error) {
		console.error('❌ Erreur lors de la récupération du fichier:', error);
		return new Response('Fichier non trouvé', { status: 404 });
	}
};

/**
 * Convertit un stream MinIO en Response avec les bons headers
 */
async function streamFileResponse(dataStream: NodeJS.ReadableStream, filePath: string): Promise<Response> {
	// Déterminer le Content-Type basé sur l'extension
	const ext = filePath.split('.').pop()?.toLowerCase();
	let contentType = 'application/octet-stream';

	switch (ext) {
		case 'glb':
			contentType = 'model/gltf-binary';
			break;
		case 'gltf':
			contentType = 'model/gltf+json';
			break;
		case 'ply':
			contentType = 'application/octet-stream';
			break;
		case 'jpg':
		case 'jpeg':
			contentType = 'image/jpeg';
			break;
		case 'png':
			contentType = 'image/png';
			break;
		case 'webp':
			contentType = 'image/webp';
			break;
	}

	// Convertir le stream en buffer
	const chunks: Buffer[] = [];
	for await (const chunk of dataStream) {
		chunks.push(chunk as Buffer);
	}
	const buffer = Buffer.concat(chunks);

	return new Response(buffer, {
		status: 200,
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=31536000',
			'Content-Length': buffer.length.toString()
		}
	});
}
