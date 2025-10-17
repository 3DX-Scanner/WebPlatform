import type { RequestHandler } from './$types';
import { minioClient } from '$lib/server/minio';

/**
 * Sert un fichier depuis MinIO (n'importe quel bucket)
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const bucketName = url.searchParams.get('bucket');
		const filePath = url.searchParams.get('path');

		if (!bucketName || !filePath) {
			return new Response('Paramètres manquants (bucket et path requis)', { status: 400 });
		}

		// Récupérer le fichier depuis MinIO
		const dataStream = await minioClient.getObject(bucketName, filePath);

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
			chunks.push(chunk);
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
	} catch (error) {
		console.error('❌ Erreur lors de la récupération du fichier:', error);
		return new Response('Fichier non trouvé', { status: 404 });
	}
};
